import type { AnalysisResult } from "./demo-analysis";

/** Follows one plant + disease over several scans so the farmer can see if it is healing. */

export interface CaseStep {
  scan: AnalysisResult;
  score: number;
}

export interface TreatmentCase {
  key: string;
  plant: string;
  disease: string;
  steps: CaseStep[];
  first: AnalysisResult;
  latest: AnalysisResult;
  recovery: number;
  trend: "Improving" | "Worsening" | "No change" | "Recovered";
  days: number;
  note: string;
}

const SEVERITY = { Low: 35, Medium: 65, High: 90 } as const;

/** 0 = fully sick, 100 = fully healthy. */
export function healthOf(scan: AnalysisResult) {
  if (scan.healthy) return 100;
  if (typeof scan.healthScore === "number") return Math.max(0, Math.min(100, scan.healthScore));
  return 100 - SEVERITY[scan.severity];
}

export function buildCases(history: AnalysisResult[]): TreatmentCase[] {
  const groups = new Map<string, AnalysisResult[]>();
  for (const scan of history) {
    const key = `${scan.plant}|${scan.disease === "Healthy" ? "Healthy" : scan.disease}`;
    groups.set(key, [...(groups.get(key) ?? []), scan]);
  }

  // A case also continues when the same plant later comes back healthy.
  const byPlant = new Map<string, AnalysisResult[]>();
  for (const scan of history) byPlant.set(scan.plant, [...(byPlant.get(scan.plant) ?? []), scan]);

  const cases: TreatmentCase[] = [];
  for (const [key, list] of groups) {
    const [plant, disease] = key.split("|") as [string, string];
    if (disease === "Healthy") continue;
    const related = (byPlant.get(plant) ?? []).filter(
      (scan) =>
        scan.disease === disease ||
        (scan.healthy && new Date(scan.date) > new Date(list[list.length - 1]!.date)),
    );
    const sorted = [...new Set([...list, ...related])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    if (sorted.length < 2) continue;

    const first = sorted[0]!;
    const latest = sorted[sorted.length - 1]!;
    const startHealth = healthOf(first);
    const nowHealth = healthOf(latest);
    const room = 100 - startHealth;
    const recovery =
      room <= 0
        ? 100
        : Math.max(0, Math.min(100, Math.round(((nowHealth - startHealth) / room) * 100)));
    const days = Math.max(
      1,
      Math.round((new Date(latest.date).getTime() - new Date(first.date).getTime()) / 86400000),
    );

    const trend: TreatmentCase["trend"] = latest.healthy
      ? "Recovered"
      : nowHealth - startHealth >= 8
        ? "Improving"
        : nowHealth - startHealth <= -8
          ? "Worsening"
          : "No change";

    const note =
      trend === "Recovered"
        ? `The ${plant} leaves look healthy again after ${days} days.`
        : trend === "Improving"
          ? `The ${disease} marks are getting smaller. Keep the same treatment.`
          : trend === "Worsening"
            ? `The ${disease} is spreading. Change the treatment and remove badly affected leaves.`
            : `No clear change in ${days} days. Check that the treatment is reaching the underside of the leaves.`;

    cases.push({
      key,
      plant,
      disease,
      steps: sorted.map((scan) => ({ scan, score: healthOf(scan) })),
      first,
      latest,
      recovery,
      trend,
      days,
      note,
    });
  }

  return cases.sort(
    (a, b) => new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime(),
  );
}

/** Overall farm health from every scan, newer scans count more. */
export function farmHealthScore(history: AnalysisResult[]) {
  if (!history.length) return 0;
  const now = Date.now();
  let weighted = 0;
  let weight = 0;
  for (const scan of history) {
    const ageDays = (now - new Date(scan.date).getTime()) / 86400000;
    const w = ageDays <= 7 ? 3 : ageDays <= 30 ? 2 : 1;
    weighted += healthOf(scan) * w;
    weight += w;
  }
  return Math.round(weighted / Math.max(weight, 1));
}

export function scoreLabel(score: number) {
  if (score >= 80) return { label: "Good", tone: "text-fern-ink" };
  if (score >= 60) return { label: "Fair", tone: "text-amber-ink" };
  if (score >= 40) return { label: "Weak", tone: "text-amber-ink" };
  return { label: "Poor", tone: "text-destructive-ink" };
}
