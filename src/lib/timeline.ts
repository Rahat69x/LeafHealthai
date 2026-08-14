import type { AnalysisResult } from "./demo-analysis";
import { healthOf } from "./treatment-progress";

/**
 * Growth and recovery timeline. Scans of the same plant are linked with a
 * simple name the user chooses ("Tomato bed 1"). Everything stays on device.
 */

export interface TimelinePoint {
  scan: AnalysisResult;
  day: number;
  health: number;
  severity: number;
  recovery: number;
  date: string;
}

export interface PlantTimeline {
  tag: string;
  plant: string;
  points: TimelinePoint[];
  first: AnalysisResult;
  latest: AnalysisResult;
  days: number;
  healthChange: number;
  recovery: number;
  trend: "Improving" | "Worsening" | "Steady" | "Recovered";
  summary: string[];
  improvements: string[];
  newSymptoms: string[];
}

const SEVERITY_SCORE = { Low: 30, Medium: 60, High: 90 } as const;

/** Groups history by the plant name the user gave, falling back to the crop name. */
export function buildTimelines(history: AnalysisResult[]): PlantTimeline[] {
  const groups = new Map<string, AnalysisResult[]>();
  for (const scan of history) {
    const tag = (scan.plantTag ?? "").trim() || scan.plant;
    groups.set(tag, [...(groups.get(tag) ?? []), scan]);
  }

  const timelines: PlantTimeline[] = [];
  for (const [tag, list] of groups) {
    if (list.length < 2) continue;
    const sorted = [...list].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const first = sorted[0]!;
    const latest = sorted[sorted.length - 1]!;
    const start = new Date(first.date).getTime();
    const startHealth = healthOf(first);
    const room = Math.max(1, 100 - startHealth);

    const points: TimelinePoint[] = sorted.map((scan) => {
      const health = healthOf(scan);
      return {
        scan,
        day: Math.max(0, Math.round((new Date(scan.date).getTime() - start) / 86400000)),
        health,
        severity: scan.healthy ? 0 : SEVERITY_SCORE[scan.severity],
        recovery: Math.max(0, Math.min(100, Math.round(((health - startHealth) / room) * 100))),
        date: scan.date,
      };
    });

    const healthChange = healthOf(latest) - startHealth;
    const recovery = points[points.length - 1]!.recovery;
    const days = Math.max(1, Math.round((new Date(latest.date).getTime() - start) / 86400000));

    const trend: PlantTimeline["trend"] = latest.healthy
      ? "Recovered"
      : healthChange >= 8
        ? "Improving"
        : healthChange <= -8
          ? "Worsening"
          : "Steady";

    const firstSigns = new Set(
      (first.visibleSymptoms ?? first.symptoms).map((line) => line.toLowerCase()),
    );
    const latestSigns = latest.visibleSymptoms ?? latest.symptoms;
    const newSymptoms = latestSigns.filter((line) => !firstSigns.has(line.toLowerCase()));
    const improvements = (first.visibleSymptoms ?? first.symptoms).filter(
      (line) => !latestSigns.some((current) => current.toLowerCase() === line.toLowerCase()),
    );

    const summary =
      trend === "Recovered"
        ? [
            `The plant looks healthy again after ${days} days.`,
            "Keep watering the soil and check once a week.",
          ]
        : trend === "Improving"
          ? [
              "The disease appears to be improving.",
              `Leaf damage has reduced by about ${Math.round(healthChange)} points in ${days} days.`,
              "Continue the current treatment.",
            ]
          : trend === "Worsening"
            ? [
                "The disease is getting worse.",
                `Health has dropped by about ${Math.abs(Math.round(healthChange))} points in ${days} days.`,
                "Change the treatment and remove badly affected leaves today.",
              ]
            : [
                `There is no clear change in ${days} days.`,
                "Check that the spray reaches the underside of the leaves.",
                "Take the next photo in 3 days at the same time of day.",
              ];

    timelines.push({
      tag,
      plant: latest.plant,
      points,
      first,
      latest,
      days,
      healthChange: Math.round(healthChange),
      recovery,
      trend,
      summary,
      improvements: improvements.slice(0, 4),
      newSymptoms: newSymptoms.slice(0, 4),
    });
  }

  return timelines.sort(
    (a, b) => new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime(),
  );
}

/** Existing plant names the user can pick from when saving a new scan. */
export function knownTags(history: AnalysisResult[]) {
  return [...new Set(history.map((scan) => (scan.plantTag ?? "").trim()).filter(Boolean))];
}
