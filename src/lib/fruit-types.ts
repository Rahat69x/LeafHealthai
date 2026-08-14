/**
 * Shared, browser-safe types and rules for the fruit pipeline.
 * Mirrors the leaf pipeline so the same photo can hold leaves, fruits, or both.
 */
import type { LeafBox, LeafMask } from "./leaf-types";

/** Fruits the app can name and check. */
export const SUPPORTED_FRUITS = [
  "Apple",
  "Mango",
  "Banana",
  "Orange",
  "Lemon",
  "Guava",
  "Papaya",
  "Tomato",
  "Potato",
  "Grape",
  "Strawberry",
  "Watermelon",
  "Pomegranate",
  "Litchi",
  "Dragon Fruit",
  "Cucumber",
  "Eggplant",
  "Bell Pepper",
  "Chili",
  "Avocado",
  "Pineapple",
  "Peach",
  "Pear",
];

/** How many fruits we check in one photo. */
export const MAX_FRUITS = 30;
/** How many fruit checks run at the same time. */
export const FRUIT_CONCURRENCY = 4;

export type FruitQuality = "Excellent" | "Good" | "Fair" | "Poor";
export type FruitMarket = "Market Ready" | "Needs Treatment" | "Not Marketable";
export type FruitRipeness = "Unripe" | "Early Ripe" | "Ripe" | "Overripe" | "Unknown";

/** Result for one single fruit inside a photo that may hold many fruits. */
export interface FruitDiagnosis {
  /** 1, 2, 3 ... the number drawn on the photo. */
  index: number;
  box: LeafBox;
  mask?: LeafMask;
  /** Fruit species, e.g. "Mango". */
  fruit: string;
  disease: string;
  healthy: boolean;
  severity: "Low" | "Medium" | "High";
  confidence: number;
  healthScore: number;
  quality: FruitQuality;
  marketability: FruitMarket;
  ripeness: FruitRipeness;
  /** "ok" when we could read this fruit, "unclear" when we could not. */
  status: "ok" | "unclear";
  note: string;
  /** Bruises, rot, cracks, sunburn, insect holes and so on. */
  defects: string[];
  visibleSymptoms: string[];
  causes: string[];
  treatment: string[];
  organic: string[];
  chemical: string[];
  prevention: string[];
  nextSteps: string[];
  /** Marks on the fruit for the explainable-AI heatmap, 0-1 positions. */
  hotspots: { x: number; y: number; r: number; label?: string; intensity?: number }[];
}

/** One fruit the photo checker found, before any disease work is done. */
export interface FoundFruit {
  index: number;
  box: LeafBox;
  mask?: LeafMask;
  where?: string;
  fruit: string;
  clear: boolean;
}

/** Result of checking one fruit. */
export interface FruitCheck {
  fruit: FruitDiagnosis;
}

/** Matches a free text fruit name to the supported list. */
export function matchFruit(name: unknown): string | null {
  const value = String(name ?? "")
    .trim()
    .toLowerCase();
  if (!value || value === "unknown") return null;
  const alias: Record<string, string> = {
    lime: "Lemon",
    tangerine: "Orange",
    mandarin: "Orange",
    citrus: "Orange",
    brinjal: "Eggplant",
    aubergine: "Eggplant",
    capsicum: "Bell Pepper",
    "sweet pepper": "Bell Pepper",
    chilli: "Chili",
    "chili pepper": "Chili",
    lychee: "Litchi",
    lichi: "Litchi",
    pitaya: "Dragon Fruit",
    melon: "Watermelon",
    "custard apple": "Guava",
  };
  for (const [key, mapped] of Object.entries(alias)) {
    if (value.includes(key)) return mapped;
  }
  const hit = SUPPORTED_FRUITS.find(
    (fruit) => value.includes(fruit.toLowerCase()) || fruit.toLowerCase().includes(value),
  );
  return hit ?? null;
}

export function unclearFruit(
  index: number,
  box: LeafBox,
  fruit: string,
  note: string,
): FruitDiagnosis {
  return {
    index,
    box,
    fruit,
    disease: "Not clear",
    healthy: false,
    severity: "Low",
    confidence: 0,
    healthScore: 0,
    quality: "Fair",
    marketability: "Needs Treatment",
    ripeness: "Unknown",
    status: "unclear",
    note,
    defects: [],
    visibleSymptoms: [],
    causes: [],
    treatment: [],
    organic: [],
    chemical: [],
    prevention: [],
    nextSteps: [],
    hotspots: [],
  };
}

/** Numbers shown above the fruit cards. */
export interface FruitSummary {
  total: number;
  healthy: number;
  diseased: number;
  skipped: number;
  healthScore: number;
  avgConfidence: number;
  avgSeverity: number;
  marketReady: number;
}

export function severityScore(severity: "Low" | "Medium" | "High") {
  return severity === "High" ? 3 : severity === "Medium" ? 2 : 1;
}

export function summariseFruits(fruits: FruitDiagnosis[]): FruitSummary {
  const read = fruits.filter((fruit) => fruit.status === "ok");
  const healthy = read.filter((fruit) => fruit.healthy);
  const sick = read.filter((fruit) => !fruit.healthy);
  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  return {
    total: fruits.length,
    healthy: healthy.length,
    diseased: sick.length,
    skipped: fruits.length - read.length,
    healthScore: avg(read.map((fruit) => fruit.healthScore)),
    avgConfidence: avg(read.map((fruit) => fruit.confidence)),
    avgSeverity: sick.length
      ? Math.round(
          (sick.reduce((sum, fruit) => sum + severityScore(fruit.severity), 0) / sick.length) * 10,
        ) / 10
      : 0,
    marketReady: read.filter((fruit) => fruit.marketability === "Market Ready").length,
  };
}

/** Colour used for the box drawn around a fruit. */
export function fruitColour(fruit: FruitDiagnosis) {
  if (fruit.status !== "ok") return "#94a3b8";
  return fruit.healthy ? "#16a34a" : "#dc2626";
}
