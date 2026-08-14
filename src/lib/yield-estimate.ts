import type { AnalysisResult } from "./demo-analysis";

/**
 * Rough crop loss maths. Everything here is an estimate built from public
 * average yields and typical disease loss ranges. It is never an exact value,
 * and the UI must always say so.
 */

export interface FarmInputs {
  /** Field size in hectares. */
  areaHa: number;
  /** Local farm gate price for 1 kg of the crop, in the user's currency. */
  pricePerKg: number;
  currency: string;
  /** Optional growth stage, which changes how much damage matters. */
  stage?: GrowthStage;
}

export type GrowthStage = "Seedling" | "Vegetative" | "Flowering" | "Fruiting" | "Near harvest";

export const GROWTH_STAGES: GrowthStage[] = [
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Near harvest",
];

export const DEFAULT_INPUTS: FarmInputs = { areaHa: 0.4, pricePerKg: 0.35, currency: "USD" };

/** Average healthy yield in tons per hectare (public crop statistics, rounded). */
const BASE_YIELD: Record<string, number> = {
  Tomato: 32,
  Potato: 22,
  Corn: 8,
  Rice: 4.5,
  Wheat: 3.5,
  "Chili Pepper": 9,
  Eggplant: 25,
  Cucumber: 20,
  Pumpkin: 18,
  Bean: 2.5,
  Okra: 12,
  Cabbage: 30,
  Onion: 20,
  Mango: 10,
  Banana: 35,
  Papaya: 40,
  Guava: 15,
  Citrus: 18,
  Grape: 15,
  Apple: 20,
  Peach: 14,
  Cherry: 8,
  Strawberry: 22,
  Squash: 18,
  Soybean: 2.8,
  Cotton: 2.2,
  Jute: 2.5,
  Tea: 2,
  Sugarcane: 70,
};

const SEVERITY_LOSS = { Low: 0.07, Medium: 0.18, High: 0.34 } as const;

const STAGE_FACTOR: Record<GrowthStage, number> = {
  Seedling: 1.3,
  Vegetative: 1.15,
  Flowering: 1.25,
  Fruiting: 1,
  "Near harvest": 0.6,
};

export interface YieldEstimate {
  plant: string;
  /** Yield the field would give with no disease. */
  healthyTons: number;
  /** Yield we expect with the disease left as it is now. */
  expectedTons: number;
  lossTons: number;
  lossPercent: number;
  /** Low and high end of the loss range, in percent. */
  range: [number, number];
  money: number;
  currency: string;
  impact: "None" | "Low" | "Medium" | "High";
  /** Plain lines explaining what drove the number. */
  drivers: string[];
  /** What happens if nothing is done. */
  ifIgnored: string;
  /** True when we have no average yield for this crop. */
  approximateCrop: boolean;
}

export function estimateYield(
  result: AnalysisResult,
  inputs: FarmInputs,
  weather?: { humidity: number; rainChance: number } | null,
): YieldEstimate {
  const base = BASE_YIELD[result.plant];
  const approximateCrop = base === undefined;
  const perHa = base ?? 10;
  const area = Math.max(0.01, inputs.areaHa);
  const healthyTons = perHa * area;

  const drivers: string[] = [];
  let loss = result.healthy ? 0 : SEVERITY_LOSS[result.severity];
  if (!result.healthy)
    drivers.push(`${result.disease} at ${result.severity.toLowerCase()} severity`);

  const stage = inputs.stage;
  if (stage && !result.healthy) {
    loss *= STAGE_FACTOR[stage];
    drivers.push(`The crop is at the ${stage.toLowerCase()} stage`);
  }

  if (!result.healthy && weather) {
    if (weather.humidity >= 80 || weather.rainChance >= 60) {
      loss *= 1.2;
      drivers.push("Wet weather helps the disease spread");
    } else if (weather.humidity < 50 && weather.rainChance < 20) {
      loss *= 0.85;
      drivers.push("Dry weather slows the disease down");
    }
  }

  // Low confidence widens the range instead of changing the middle value.
  const spread = result.confidence >= 85 ? 0.3 : result.confidence >= 70 ? 0.45 : 0.6;
  loss = Math.max(0, Math.min(0.85, loss));

  const lossPercent = Math.round(loss * 100);
  const lossTons = healthyTons * loss;
  const expectedTons = Math.max(0, healthyTons - lossTons);
  const money = lossTons * 1000 * Math.max(0, inputs.pricePerKg);

  const impact: YieldEstimate["impact"] =
    lossPercent === 0 ? "None" : lossPercent < 10 ? "Low" : lossPercent < 25 ? "Medium" : "High";

  const ifIgnored = result.healthy
    ? "Keep checking every week so a new problem is found early."
    : `If nothing is done, the loss can grow to about ${Math.min(90, Math.round(lossPercent * 2.2))}% in two to three weeks, because the disease keeps spreading to new leaves.`;

  return {
    plant: result.plant,
    healthyTons: round(healthyTons),
    expectedTons: round(expectedTons),
    lossTons: round(lossTons),
    lossPercent,
    range: [
      Math.max(0, Math.round(lossPercent * (1 - spread))),
      Math.min(95, Math.round(lossPercent * (1 + spread))),
    ],
    money: Math.round(money),
    currency: inputs.currency,
    impact,
    drivers,
    ifIgnored,
    approximateCrop,
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

const KEY = "leafcheck.farm.inputs.v1";

export function loadInputs(): FarmInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_INPUTS;
    const parsed = JSON.parse(raw) as Partial<FarmInputs>;
    return {
      areaHa: Number(parsed.areaHa) > 0 ? Number(parsed.areaHa) : DEFAULT_INPUTS.areaHa,
      pricePerKg:
        Number(parsed.pricePerKg) >= 0 ? Number(parsed.pricePerKg) : DEFAULT_INPUTS.pricePerKg,
      currency:
        typeof parsed.currency === "string" && parsed.currency
          ? parsed.currency
          : DEFAULT_INPUTS.currency,
      ...(parsed.stage && GROWTH_STAGES.includes(parsed.stage) ? { stage: parsed.stage } : {}),
    };
  } catch {
    return DEFAULT_INPUTS;
  }
}

export function saveInputs(inputs: FarmInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(inputs));
  } catch {
    /* optional */
  }
}
