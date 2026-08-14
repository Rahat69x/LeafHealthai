/**
 * Runs one photo through the two-stage pipeline from the browser:
 * check the photo, then check every leaf in parallel with live progress.
 */
import { FRUIT_CONCURRENCY, type FruitCheck, type FruitDiagnosis } from "./fruit-types";
import { fruitPrimary } from "./fruit-summary";
import {
  LEAF_CONCURRENCY,
  pickPrimary,
  summariseLeaves,
  type AiDiagnosis,
  type LeafBox,
  type LeafCheck,
  type VerifyResult,
} from "./leaf-types";

export interface ScanProgress {
  stage: "verify" | "leaves" | "fruits";
  done: number;
  total: number;
}

type VerifyFn = (opts: { data: { image: string } }) => Promise<VerifyResult>;
type LeafFn = (opts: {
  data: {
    image: string;
    index: number;
    total: number;
    box: LeafBox;
    plant: string;
    where?: string | undefined;
    place?: string | undefined;
    weather?: string | undefined;
  };
}) => Promise<LeafCheck>;

type FruitFn = (opts: {
  data: {
    image: string;
    index: number;
    total: number;
    box: LeafBox;
    fruit: string;
    where?: string | undefined;
    place?: string | undefined;
    weather?: string | undefined;
  };
}) => Promise<FruitCheck>;

export interface ScanInput {
  image: string;
  place?: string | undefined;
  weather?: string | undefined;
  verify: VerifyFn;
  diagnoseLeafAt: LeafFn;
  diagnoseFruitAt?: FruitFn | undefined;
  onProgress?: (progress: ScanProgress) => void;
}

const REFUSED: Pick<AiDiagnosis, "plant" | "disease"> = {
  plant: "Unknown plant",
  disease: "Unknown",
};

/** Runs a small pool of leaf checks at a time so slow phones stay responsive. */
async function pool<T, R>(items: T[], size: number, run: (item: T) => Promise<R>) {
  const results: R[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index];
      if (item === undefined) return;
      results[index] = await run(item);
    }
  });
  await Promise.all(workers);
  return results.filter(Boolean);
}

export async function runLeafScan(input: ScanInput): Promise<AiDiagnosis> {
  input.onProgress?.({ stage: "verify", done: 0, total: 0 });
  const verify = await input.verify({ data: { image: input.image } });

  if (!verify.ok) {
    return {
      ...REFUSED,
      ok: false,
      rejectKind: verify.rejectKind,
      rejectReason: verify.rejectReason,
      rejectHelp: verify.rejectHelp,
      healthy: false,
      severity: "Low",
      confidence: 0,
      healthScore: 0,
      about: "",
      reasoning: [],
      visualPatterns: [],
      visibleSymptoms: [],
      symptoms: [],
      causes: [],
      treatment: [],
      organic: [],
      chemical: [],
      prevention: [],
      practices: [],
      recovery: [],
      nextSteps: [],
      healthyLook: [],
      predictions: [],
      hotspots: [],
      trusted: false,
      chemicalSafe: false,
      nutrients: [],
      pests: [],
      leaves: [],
      fruits: [],
    };
  }

  const total = verify.leaves.length;
  let done = 0;
  input.onProgress?.({ stage: "leaves", done, total });

  const checks = await pool(verify.leaves, LEAF_CONCURRENCY, async (leaf) => {
    const check = await input.diagnoseLeafAt({
      data: {
        image: input.image,
        index: leaf.index,
        total,
        box: leaf.box,
        plant: leaf.plant,
        where: leaf.where,
        place: input.place,
        weather: input.weather,
      },
    });
    done += 1;
    input.onProgress?.({ stage: "leaves", done, total });
    return check;
  });

  const leaves = checks
    .map((check, index) => {
      const found = verify.leaves[index];
      return found?.mask ? { ...check.leaf, mask: found.mask } : check.leaf;
    })
    .sort((a, b) => a.index - b.index);

  let fruits: FruitDiagnosis[] = [];
  if (verify.fruits.length && input.diagnoseFruitAt) {
    const diagnoseFruitAt = input.diagnoseFruitAt;
    const fruitTotal = verify.fruits.length;
    let fruitDone = 0;
    input.onProgress?.({ stage: "fruits", done: fruitDone, total: fruitTotal });
    const fruitChecks = await pool(verify.fruits, FRUIT_CONCURRENCY, async (found) => {
      const check = await diagnoseFruitAt({
        data: {
          image: input.image,
          index: found.index,
          total: fruitTotal,
          box: found.box,
          fruit: found.fruit,
          where: found.where,
          place: input.place,
          weather: input.weather,
        },
      });
      fruitDone += 1;
      input.onProgress?.({ stage: "fruits", done: fruitDone, total: fruitTotal });
      return check;
    });
    fruits = fruitChecks
      .map((check, index) => {
        const found = verify.fruits[index];
        return found?.mask ? { ...check.fruit, mask: found.mask } : check.fruit;
      })
      .sort((a, b) => a.index - b.index);
  }

  const summary = summariseLeaves(leaves);
  const notice = summary.skipped > 0 ? "Some leaves could not be analysed accurately." : undefined;
  const primary = pickPrimary(checks);

  if (primary) return { ...primary, leaves, fruits, notice };

  const fruitOnly = fruitPrimary(fruits);
  if (fruitOnly) return { ...fruitOnly, leaves, fruits, notice };

  const firstProblem = checks.find((check) => check.full && !check.full.ok)?.full;
  if (firstProblem) return { ...firstProblem, leaves, fruits, notice };

  return {
    ...REFUSED,
    ok: false,
    rejectKind: "unknown-disease",
    rejectReason: "We could not identify a disease on these leaves.",
    rejectHelp: [
      "Take a closer photo of the worst leaf, in soft daylight.",
      "If the plant keeps getting worse, ask a local agriculture officer.",
    ],
    healthy: false,
    severity: "Low",
    confidence: 0,
    healthScore: 0,
    about: "",
    reasoning: [],
    visualPatterns: [],
    visibleSymptoms: [],
    symptoms: [],
    causes: [],
    treatment: [],
    organic: [],
    chemical: [],
    prevention: [],
    practices: [],
    recovery: [],
    nextSteps: [],
    healthyLook: [],
    predictions: [],
    hotspots: [],
    trusted: false,
    chemicalSafe: false,
    nutrients: [],
    pests: [],
    leaves,
    fruits,
    notice,
  };
}
