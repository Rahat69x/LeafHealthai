/**
 * Shared, browser-safe types and rules for the leaf pipeline.
 * No server code here, so both the UI and the server functions can import it.
 */
import type { FoundFruit, FruitDiagnosis } from "./fruit-types";
import type { NutrientFinding } from "./nutrients";
import type { PestFinding } from "./pests";

/**
 * Plants the app is allowed to answer for. If the leaf is from another plant we
 * say so instead of guessing a disease.
 */
export const SUPPORTED_PLANTS = [
  "Tomato",
  "Potato",
  "Corn",
  "Rice",
  "Wheat",
  "Chili Pepper",
  "Eggplant",
  "Cucumber",
  "Pumpkin",
  "Bean",
  "Okra",
  "Cabbage",
  "Onion",
  "Mango",
  "Banana",
  "Papaya",
  "Guava",
  "Citrus",
  "Grape",
  "Apple",
  "Peach",
  "Cherry",
  "Strawberry",
  "Squash",
  "Soybean",
  "Cotton",
  "Jute",
  "Tea",
  "Sugarcane",
];

/** Below this we never show a disease name as if it were true. */
export const MIN_CONFIDENCE = 65;
/** Below this we never suggest any chemical spray. */
export const CHEMICAL_CONFIDENCE = 80;
/** How many leaves we check in one photo. */
export const MAX_LEAVES = 24;
/** How many leaf checks run at the same time. */
export const LEAF_CONCURRENCY = 4;

export type RejectKind =
  | "not-leaf"
  | "partial-leaf"
  | "quality"
  | "unsupported-plant"
  | "low-confidence"
  | "unknown-disease";

/** Where a leaf sits in the photo, as 0-1 shares of width and height. */
export interface LeafBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A rough outline of the leaf, as 0-1 points. Used to shade the leaf. */
export type LeafMask = { x: number; y: number }[];

/** Result for one single leaf inside a photo that may hold many leaves. */
export interface LeafDiagnosis {
  /** 1, 2, 3 ... the number drawn on the photo. */
  index: number;
  box: LeafBox;
  mask?: LeafMask;
  plant: string;
  disease: string;
  healthy: boolean;
  severity: "Low" | "Medium" | "High";
  confidence: number;
  healthScore: number;
  /** "ok" when we could read this leaf, "unclear" when we could not. */
  status: "ok" | "unclear";
  /** Plain line telling the farmer what this leaf shows, or why we could not tell. */
  note: string;
  visibleSymptoms: string[];
  treatment: string[];
  organic: string[];
  chemical: string[];
  nextSteps: string[];
  nutrients: NutrientFinding[];
  pests: PestFinding[];
}

export interface AiDiagnosis {
  ok: boolean;
  rejectKind?: RejectKind | undefined;
  rejectReason?: string | undefined;
  /** Extra plain lines telling the user what to do next when ok is false. */
  rejectHelp: string[];
  plant: string;
  disease: string;
  healthy: boolean;
  severity: "Low" | "Medium" | "High";
  confidence: number;
  healthScore: number;
  about: string;
  reasoning: string[];
  visibleSymptoms: string[];
  symptoms: string[];
  causes: string[];
  treatment: string[];
  organic: string[];
  chemical: string[];
  prevention: string[];
  practices: string[];
  recovery: string[];
  nextSteps: string[];
  healthyLook: string[];
  predictions: { plant: string; disease: string; confidence: number }[];
  hotspots: { x: number; y: number; r: number; label?: string; intensity?: number }[];
  /** Key visual patterns the model used, in plain words. */
  visualPatterns: string[];
  /** True when we are sure enough to show treatment advice. */
  trusted: boolean;
  /** True when a chemical spray may be shown. */
  chemicalSafe: boolean;
  /** Nutrient shortages seen on the leaf. Empty when nothing is sure enough. */
  nutrients: NutrientFinding[];
  /** Insect pests seen on the leaf. One entry per pest. */
  pests: PestFinding[];
  /** One entry for every leaf found in the photo, in reading order. */
  leaves: LeafDiagnosis[];
  /** One entry for every fruit found in the photo, in reading order. */
  fruits: FruitDiagnosis[];
  /** Soft warning shown with the result, e.g. some leaves were skipped. */
  notice?: string | undefined;
}

/** One leaf the photo checker found, before any disease work is done. */
export interface FoundLeaf {
  index: number;
  box: LeafBox;
  mask?: LeafMask;
  where?: string;
  plant: string;
  clear: boolean;
}

export type VerifyResult =
  | { ok: false; rejectKind: RejectKind; rejectReason: string; rejectHelp: string[] }
  | { ok: true; plant: string; leaves: FoundLeaf[]; fruits: FoundFruit[] };

/** Result of checking one leaf: the card data plus the full write-up. */
export interface LeafCheck {
  leaf: LeafDiagnosis;
  full: AiDiagnosis | null;
}

export function severityRank(severity: "Low" | "Medium" | "High") {
  return severity === "High" ? 3 : severity === "Medium" ? 2 : 1;
}

/** Keeps a box inside the photo, with a safe default. */
export function safeBox(box: Partial<LeafBox> | undefined): LeafBox {
  const clamp = (value: unknown, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : fallback;
  };
  const x = clamp(box?.x, 0.05);
  const y = clamp(box?.y, 0.05);
  const w = Math.max(0.04, Math.min(1 - x, clamp(box?.w, 0.9)));
  const h = Math.max(0.04, Math.min(1 - y, clamp(box?.h, 0.9)));
  return { x, y, w, h };
}

/** How much two boxes overlap, 0-1. Used to drop duplicate detections. */
export function boxOverlap(a: LeafBox, b: LeafBox) {
  const w = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const h = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = w * h;
  if (inter <= 0) return 0;
  return inter / (a.w * a.h + b.w * b.h - inter);
}

/** Drops boxes that are really the same leaf found twice. */
export function dedupeLeaves<T extends { box: LeafBox }>(items: T[], limit = 0.55): T[] {
  const kept: T[] = [];
  for (const item of items) {
    if (kept.some((other) => boxOverlap(other.box, item.box) > limit)) continue;
    kept.push(item);
  }
  return kept;
}

export function unclearLeaf(
  index: number,
  box: LeafBox,
  plant: string,
  note: string,
): LeafDiagnosis {
  return {
    index,
    box,
    plant,
    disease: "Not clear",
    healthy: false,
    severity: "Low",
    confidence: 0,
    healthScore: 0,
    status: "unclear",
    note,
    visibleSymptoms: [],
    treatment: [],
    organic: [],
    chemical: [],
    nextSteps: [],
    nutrients: [],
    pests: [],
  };
}

/** A blank result object, used as a base for refusals and fruit-only answers. */
export function emptyDiagnosis(): AiDiagnosis {
  return {
    ok: false,
    rejectHelp: [],
    plant: "Unknown plant",
    disease: "Unknown",
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

/** Matches a free text plant name to the supported list. */
export function matchPlant(name: unknown): string | null {
  const value = String(name ?? "")
    .trim()
    .toLowerCase();
  if (!value || value === "unknown") return null;
  const alias: Record<string, string> = {
    maize: "Corn",
    brinjal: "Eggplant",
    aubergine: "Eggplant",
    capsicum: "Chili Pepper",
    pepper: "Chili Pepper",
    chilli: "Chili Pepper",
    chili: "Chili Pepper",
    paddy: "Rice",
    lemon: "Citrus",
    lime: "Citrus",
    orange: "Citrus",
    ladyfinger: "Okra",
    "lady finger": "Okra",
    "bell pepper": "Chili Pepper",
    courgette: "Squash",
    zucchini: "Squash",
    gourd: "Pumpkin",
  };
  for (const [key, mapped] of Object.entries(alias)) {
    if (value.includes(key)) return mapped;
  }
  const hit = SUPPORTED_PLANTS.find(
    (plant) => value.includes(plant.toLowerCase()) || plant.toLowerCase().includes(value),
  );
  return hit ?? null;
}

/** Numbers shown above the leaf cards. */
export interface LeafSummary {
  total: number;
  healthy: number;
  diseased: number;
  skipped: number;
  healthScore: number;
  avgConfidence: number;
}

export function summariseLeaves(leaves: LeafDiagnosis[]): LeafSummary {
  const read = leaves.filter((leaf) => leaf.status === "ok");
  const healthy = read.filter((leaf) => leaf.healthy);
  const score = read.length
    ? Math.round(read.reduce((sum, leaf) => sum + leaf.healthScore, 0) / read.length)
    : 0;
  const conf = read.length
    ? Math.round(read.reduce((sum, leaf) => sum + leaf.confidence, 0) / read.length)
    : 0;
  return {
    total: leaves.length,
    healthy: healthy.length,
    diseased: read.length - healthy.length,
    skipped: leaves.length - read.length,
    healthScore: score,
    avgConfidence: conf,
  };
}

/** Picks the leaf whose write-up becomes the main result. Worst leaf wins. */
export function pickPrimary(checks: LeafCheck[]): AiDiagnosis | null {
  let best: AiDiagnosis | null = null;
  let bestRank = -1;
  for (const check of checks) {
    const full = check.full;
    if (!full || !full.ok) continue;
    const rank =
      (full.healthy ? 0 : 100) + severityRank(full.severity) * 10 + full.confidence / 100;
    if (rank > bestRank) {
      bestRank = rank;
      best = full;
    }
  }
  return best;
}
