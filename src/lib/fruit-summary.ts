/**
 * Builds a main result from fruit findings, for photos that show only fruits
 * (or where no leaf could be diagnosed). Browser-safe.
 */
import { emptyDiagnosis, type AiDiagnosis } from "./leaf-types";
import { severityScore, summariseFruits, type FruitDiagnosis } from "./fruit-types";

export function fruitPrimary(fruits: FruitDiagnosis[]): AiDiagnosis | null {
  const read = fruits.filter((fruit) => fruit.status === "ok");
  if (!read.length) return null;

  const worst = [...read].sort(
    (a, b) =>
      Number(a.healthy) - Number(b.healthy) ||
      severityScore(b.severity) - severityScore(a.severity) ||
      b.confidence - a.confidence,
  )[0]!;
  const summary = summariseFruits(fruits);
  const allHealthy = summary.diseased === 0;

  return {
    ...emptyDiagnosis(),
    ok: true,
    trusted: true,
    chemicalSafe: worst.chemical.length > 0,
    plant: worst.fruit,
    disease: allHealthy ? "No visible disease" : worst.disease,
    healthy: allHealthy,
    severity: worst.severity,
    confidence: summary.avgConfidence,
    healthScore: summary.healthScore,
    about: allHealthy
      ? `We checked ${summary.total} fruit${summary.total === 1 ? "" : "s"} in this photo and found no visible disease.`
      : `We checked ${summary.total} fruit${summary.total === 1 ? "" : "s"}. ${summary.diseased} need${summary.diseased === 1 ? "s" : ""} care. The worst one shows ${worst.disease}.`,
    reasoning: worst.visibleSymptoms,
    visualPatterns: worst.defects,
    visibleSymptoms: worst.visibleSymptoms,
    symptoms: worst.visibleSymptoms,
    causes: worst.causes,
    treatment: worst.treatment,
    organic: worst.organic,
    chemical: worst.chemical,
    prevention: worst.prevention,
    nextSteps: worst.nextSteps,
    predictions: read.slice(0, 3).map((fruit) => ({
      plant: fruit.fruit,
      disease: fruit.disease,
      confidence: fruit.confidence,
    })),
    hotspots: read.flatMap((fruit) => fruit.hotspots).slice(0, 12),
    fruits,
  };
}
