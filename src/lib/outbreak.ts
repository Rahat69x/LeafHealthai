import type { AnalysisResult } from "./demo-analysis";
import { AREAS, type Area } from "./regions";

/**
 * Outbreak watch. Reports are anonymous: only disease, area and date are kept,
 * never the photo or anything about the person. Cloud sharing is off, so this
 * reads the reports stored on this device.
 */

export interface DiseaseReport {
  id: string;
  disease: string;
  plant: string;
  area: string;
  latitude: number;
  longitude: number;
  date: string;
  severity: "Low" | "Medium" | "High";
}

export interface Outbreak {
  disease: string;
  area: string;
  latitude: number;
  longitude: number;
  reports: number;
  recent: number;
  crops: string[];
  level: "Watch" | "Warning" | "Outbreak";
  lastSeen: string;
  trend: "Rising" | "Steady" | "Falling";
  actions: string[];
}

const KEY = "leafcheck.reports.v1";
const OPT_KEY = "leafcheck.reports.optin";
const WINDOW_DAYS = 14;

export function sharingOn() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(OPT_KEY) !== "off";
}

export function setSharing(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OPT_KEY, on ? "on" : "off");
}

export function loadReports(): DiseaseReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as DiseaseReport[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReports(items: DiseaseReport[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(-400)));
  } catch {
    /* optional */
  }
}

export function nearestArea(place?: string, latitude?: number, longitude?: number): Area | null {
  if (place) {
    const lower = place.toLowerCase();
    const named = AREAS.find(
      (area) =>
        lower.includes(area.city.toLowerCase()) || lower.includes(area.district.toLowerCase()),
    );
    if (named) return named;
  }
  if (typeof latitude === "number" && typeof longitude === "number") {
    let best: Area | null = null;
    let bestDistance = Infinity;
    for (const area of AREAS) {
      const distance = haversine(latitude, longitude, area.latitude, area.longitude);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = area;
      }
    }
    return best;
  }
  return null;
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Adds one anonymous report for a scan. Nothing personal is stored. */
export function reportScan(scan: AnalysisResult, latitude?: number, longitude?: number) {
  if (!sharingOn() || scan.healthy || !scan.disease) return loadReports();
  const area = nearestArea(scan.place, latitude, longitude);
  if (!area) return loadReports();
  const report: DiseaseReport = {
    id: scan.id,
    disease: scan.disease,
    plant: scan.plant,
    area: `${area.city}, ${area.district}`,
    latitude: area.latitude,
    longitude: area.longitude,
    date: scan.date,
    severity: scan.severity,
  };
  const next = [...loadReports().filter((item) => item.id !== report.id), report];
  saveReports(next);
  return next;
}

export function clearReports() {
  saveReports([]);
}

function actionsFor(disease: string): string[] {
  return [
    `Check every field of the affected crop for early ${disease} marks this week.`,
    "Remove and burn badly affected leaves. Do not leave them between the rows.",
    "Do not water the leaves. Water the soil only, early in the day.",
    "Keep new plants away from the affected block and clean tools between fields.",
  ];
}

export function detectOutbreaks(reports: DiseaseReport[], now = Date.now()): Outbreak[] {
  const cutoff = now - WINDOW_DAYS * 86400000;
  const groups = new Map<string, DiseaseReport[]>();
  for (const report of reports) {
    if (new Date(report.date).getTime() < cutoff) continue;
    const key = `${report.area}|${report.disease}`;
    groups.set(key, [...(groups.get(key) ?? []), report]);
  }

  const outbreaks: Outbreak[] = [];
  for (const [key, list] of groups) {
    const recent = list.filter((item) => new Date(item.date).getTime() >= now - 7 * 86400000);
    const older = list.length - recent.length;
    if (list.length < 2) continue;
    const first = list[0]!;
    const level = list.length >= 5 ? "Outbreak" : list.length >= 3 ? "Warning" : "Watch";
    outbreaks.push({
      disease: first.disease,
      area: first.area,
      latitude: first.latitude,
      longitude: first.longitude,
      reports: list.length,
      recent: recent.length,
      crops: [...new Set(list.map((item) => item.plant))],
      level,
      lastSeen: list
        .map((item) => item.date)
        .sort()
        .at(-1)!,
      trend: recent.length > older ? "Rising" : recent.length < older ? "Falling" : "Steady",
      actions: actionsFor(first.disease),
    });
    void key;
  }

  return outbreaks.sort((a, b) => b.reports - a.reports);
}

export interface NearbyReport {
  disease: string;
  area: string;
  distanceKm: number | null;
  count: number;
  lastSeen: string;
  trend: "Rising" | "Steady" | "Falling";
  crops: string[];
}

export function nearbyReports(
  reports: DiseaseReport[],
  origin?: { latitude: number; longitude: number },
  radiusKm = 120,
): NearbyReport[] {
  const cutoff = Date.now() - 30 * 86400000;
  const groups = new Map<string, DiseaseReport[]>();
  for (const report of reports) {
    if (new Date(report.date).getTime() < cutoff) continue;
    if (
      origin &&
      haversine(origin.latitude, origin.longitude, report.latitude, report.longitude) > radiusKm
    )
      continue;
    const key = `${report.area}|${report.disease}`;
    groups.set(key, [...(groups.get(key) ?? []), report]);
  }

  return [...groups.values()]
    .map((list) => {
      const first = list[0]!;
      const recent = list.filter(
        (item) => new Date(item.date).getTime() >= Date.now() - 7 * 86400000,
      ).length;
      const older = list.length - recent;
      return {
        disease: first.disease,
        area: first.area,
        distanceKm: origin
          ? Math.round(
              haversine(origin.latitude, origin.longitude, first.latitude, first.longitude),
            )
          : null,
        count: list.length,
        lastSeen: list
          .map((item) => item.date)
          .sort()
          .at(-1)!,
        trend: (recent > older
          ? "Rising"
          : recent < older
            ? "Falling"
            : "Steady") as NearbyReport["trend"],
        crops: [...new Set(list.map((item) => item.plant))],
      };
    })
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0) || b.count - a.count);
}

export function trendingDiseases(reports: DiseaseReport[]) {
  const cutoff = Date.now() - 30 * 86400000;
  const counts = new Map<string, number>();
  for (const report of reports) {
    if (new Date(report.date).getTime() < cutoff) continue;
    counts.set(report.disease, (counts.get(report.disease) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([disease, count]) => ({ disease, count }));
}
