import type { AnalysisResult } from "./demo-analysis";
import type { AiDiagnosis } from "./diagnose.functions";
import type { PendingScan, ScanRunner } from "./offline-queue";

type DiagnoseFn = (opts: {
  data: { image: string; place?: string | undefined; weather?: string | undefined };
}) => Promise<AiDiagnosis>;

/** Turns an AI answer into the record the app stores and shows. */
export function toResult(
  ai: AiDiagnosis,
  image: string,
  quality: string,
  timeMs: number,
): AnalysisResult {
  return {
    id: `${Date.now()}-${Math.round(Math.random() * 9973)}`,
    plant: ai.plant,
    disease: ai.disease,
    healthy: ai.healthy,
    severity: ai.severity,
    about: ai.about,
    symptoms: ai.symptoms,
    causes: ai.causes,
    treatment: ai.treatment,
    organic: ai.organic,
    chemical: ai.chemical,
    prevention: ai.prevention,
    practices: ai.practices,
    recovery: ai.recovery,
    nextSteps: ai.nextSteps,
    healthyLook: ai.healthyLook,
    confidence: ai.confidence,
    healthScore: ai.healthScore,
    reasoning: ai.reasoning,
    visualPatterns: ai.visualPatterns,
    visibleSymptoms: ai.visibleSymptoms,
    predictions: ai.predictions,
    hotspots: ai.hotspots,
    nutrients: ai.nutrients ?? [],
    pests: ai.pests ?? [],
    leaves: ai.leaves ?? [],
    fruits: ai.fruits ?? [],
    notice: ai.notice,
    date: new Date().toISOString(),
    image,
    quality,
    timeMs,
    source: "ai",
  };
}

/** Runs a saved offline photo through the same strict AI pipeline. */
export function makeRunner(diagnose: DiagnoseFn): ScanRunner {
  return async (job: PendingScan) => {
    const started = Date.now();
    const ai = await diagnose({
      data: { image: job.image, place: job.place, weather: job.weather },
    });
    if (!ai.ok) return null;
    const result = toResult(ai, job.image, "Good", Date.now() - started);
    result.date = job.date;
    if (job.place) result.place = job.place;
    return result;
  };
}
