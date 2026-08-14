/**
 * Smart treatment planner.
 *
 * Builds a day by day recovery plan from the diagnosis, the pests and nutrient
 * findings, the crop, the severity and the local weather. Every step says WHY
 * it is there, so the farmer can judge it instead of just following orders.
 */

import type { NutrientFinding } from "./nutrients";
import type { PestFinding } from "./pests";

export interface PlanWeather {
  humidity: number;
  rainChance: number;
  temp?: number;
  windKph?: number;
}

export interface PlanStep {
  /** "Today", "Tomorrow", "In 3 days"... */
  when: string;
  dayOffset: number;
  title: string;
  /** What to do, in short plain lines. */
  actions: string[];
  /** Why this step matters. */
  why: string;
  kind: "remove" | "treat" | "feed" | "check" | "prevent" | "scan";
}

export interface TreatmentPlan {
  headline: string;
  /** Best time of day to spray, based on weather. */
  sprayWindow: string;
  sprayWarning?: string;
  steps: PlanStep[];
  organic: string[];
  chemical: string[];
  preventive: string[];
  safety: string[];
  /** What may happen if the farmer does nothing. */
  ifIgnored: string[];
}

interface PlanInput {
  plant: string;
  disease: string;
  healthy: boolean;
  severity: "Low" | "Medium" | "High";
  confidence: number;
  organic: string[];
  chemical: string[];
  prevention: string[];
  pests: PestFinding[];
  nutrients: NutrientFinding[];
  weather?: PlanWeather | null | undefined;
  season?: string | undefined;
  place?: string | undefined;
}

function sprayAdvice(weather?: PlanWeather | null): { window: string; warning?: string } {
  if (!weather)
    return {
      window:
        "Spray in the late afternoon or early evening, when the sun is low and the wind is calm.",
    };
  if (weather.rainChance >= 60) {
    return {
      window: "Wait for a dry gap of at least 4 hours before spraying.",
      warning: `Rain is likely (${Math.round(weather.rainChance)}% chance). Rain within 4 hours washes the spray off and wastes it.`,
    };
  }
  if ((weather.windKph ?? 0) > 15) {
    return {
      window: "Spray early morning, before the wind picks up.",
      warning: `Wind is around ${Math.round(weather.windKph ?? 0)} km/h. Spray drifts away and can harm nearby crops.`,
    };
  }
  if ((weather.temp ?? 0) >= 33) {
    return {
      window: "Spray after 4 pm when the heat drops.",
      warning:
        "It is very hot. Spraying at midday burns leaves and the liquid dries before it works.",
    };
  }
  if (weather.humidity >= 85) {
    return {
      window: "Spray in the morning once the dew has dried.",
      warning:
        "The air is very damp, so leaves stay wet for long. Fungus spreads faster in these conditions.",
    };
  }
  return { window: "Spray in the late afternoon, between 4 pm and 6 pm, when the wind is calm." };
}

function whenLabel(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `After ${days} days`;
}

function step(
  dayOffset: number,
  kind: PlanStep["kind"],
  title: string,
  actions: string[],
  why: string,
): PlanStep {
  return { when: whenLabel(dayOffset), dayOffset, title, actions, why, kind };
}

/** Builds the personal plan. Pure function, safe to run on the client. */
export function buildTreatmentPlan(input: PlanInput): TreatmentPlan {
  const spray = sprayAdvice(input.weather);
  const steps: PlanStep[] = [];
  const heavy = input.severity === "High";
  const topPest = input.pests[0];
  const topNutrient = input.nutrients[0];

  if (input.healthy && !topPest && !topNutrient) {
    return {
      headline: `Your ${input.plant} leaf looks healthy. This plan keeps it that way.`,
      sprayWindow: spray.window,
      ...(spray.warning ? { sprayWarning: spray.warning } : {}),
      steps: [
        step(
          0,
          "check",
          "Look over the whole plant",
          ["Check the lower and inner leaves too.", "Look under the leaves for insects."],
          "Problems almost always start on leaves you cannot see from the top.",
        ),
        step(
          3,
          "prevent",
          "Keep the leaves dry",
          ["Water the soil, not the leaves.", "Water in the morning so leaves dry by night."],
          "Wet leaves at night are the main reason fungus starts.",
        ),
        step(
          7,
          "scan",
          "Scan again in a week",
          ["Take a new photo of the same plant.", "Give it the same plant name so we can compare."],
          "A weekly scan catches a problem while it is still small and cheap to fix.",
        ),
      ],
      organic: [],
      chemical: [],
      preventive: input.prevention.slice(0, 5),
      safety: [
        "No spray is needed for a healthy plant. Do not spray as a habit; it wastes money and harms helpful insects.",
      ],
      ifIgnored: [
        "Nothing is wrong right now, but weekly checks stop small problems from becoming big ones.",
      ],
    };
  }

  // Day 0 - remove the source.
  const removeActions = [
    heavy
      ? "Cut off all badly marked leaves and take them out of the field."
      : "Cut off the worst marked leaves.",
    "Do not drop them on the soil. Burn or bury them away from the crop.",
    "Wash your hands and wipe your tools before touching other plants.",
  ];
  if (topPest)
    removeActions.push(
      `Knock ${topPest.name.toLowerCase()} off with a strong water spray, or pick them off by hand.`,
    );
  steps.push(
    step(
      0,
      "remove",
      "Remove the source",
      removeActions,
      "The sick leaves keep making spores. Taking them out first cuts the spread before any spray.",
    ),
  );

  // Day 0/1 - treat.
  const treatActions: string[] = [];
  if (input.organic.length) treatActions.push(...input.organic.slice(0, 2));
  if (topPest?.organic.length) treatActions.push(topPest.organic[0]!);
  if (!treatActions.length)
    treatActions.push("Use a natural neem oil spray, covering both sides of the leaf.");
  treatActions.push(spray.window);
  steps.push(
    step(
      1,
      "treat",
      "Apply the first treatment",
      treatActions,
      "Start with the natural option. It is cheaper, safer for you and does not kill the insects that help your crop.",
    ),
  );

  // Feed - only when a nutrient shortage was found.
  if (topNutrient) {
    steps.push(
      step(
        2,
        "feed",
        `Correct the ${topNutrient.name} shortage`,
        [...topNutrient.fertiliser.slice(0, 2), ...topNutrient.organic.slice(0, 1)],
        `The leaf shows a ${topNutrient.name} shortage. A weak, hungry plant cannot fight off disease, so feeding it is part of the cure.`,
      ),
    );
  }

  steps.push(
    step(
      3,
      "check",
      "Inspect the new leaves",
      [
        "Look only at the leaves that opened after the treatment.",
        "Count how many new leaves have marks.",
        topPest
          ? `Check the leaf undersides again for ${topPest.name.toLowerCase()}.`
          : "Check the leaf undersides for insects.",
      ],
      "Old marks never heal. Clean NEW leaves are the real sign that the treatment is working.",
    ),
  );

  if (heavy || input.chemical.length) {
    steps.push(
      step(
        5,
        "treat",
        "Second round, only if it is still spreading",
        [
          "If new leaves are still getting marks, repeat the treatment.",
          "If new leaves are clean, do not spray again.",
          input.chemical.length
            ? "If it is clearly worse, show the leaf to a local agriculture officer before using any chemical."
            : "Ask a local agriculture officer before moving to a chemical.",
        ],
        "Repeat sprays only when the problem is still moving. Extra sprays cost money and build resistance.",
      ),
    );
  }

  steps.push(
    step(
      7,
      "scan",
      "Take a new scan",
      [
        "Photograph the same plant in the same light.",
        "Use the same plant name so the app can compare.",
      ],
      "A second scan lets the app measure whether the plant is really recovering.",
    ),
    step(
      14,
      "check",
      "Compare recovery",
      [
        "Open the growth timeline for this plant.",
        "Look at the health score trend, not just one number.",
      ],
      "Two weeks is enough time for new growth. The trend tells you whether to stop or change the treatment.",
    ),
  );

  const ifIgnored: string[] = [];
  if (!input.healthy) {
    ifIgnored.push(
      heavy
        ? `${input.disease} is already severe. Left alone it can move through the field in one to two weeks and cut the harvest sharply.`
        : `${input.disease} usually spreads to nearby leaves within one to two weeks if nothing is done.`,
    );
  }
  if (topPest)
    ifIgnored.push(
      `${topPest.name} numbers double quickly in warm weather, and some of them also carry plant viruses.`,
    );
  if (topNutrient)
    ifIgnored.push(
      `A ${topNutrient.name} shortage that is not fixed means smaller leaves, weaker plants and a lower yield.`,
    );
  if ((input.weather?.humidity ?? 0) >= 80 || (input.weather?.rainChance ?? 0) >= 50) {
    ifIgnored.push("The damp weather right now makes the spread faster than usual.");
  }

  return {
    headline: input.healthy
      ? `Care plan for your ${input.plant}`
      : `${input.severity.toLowerCase()} severity plan for ${input.plant} · ${input.disease}`,
    sprayWindow: spray.window,
    ...(spray.warning ? { sprayWarning: spray.warning } : {}),
    steps: steps.sort((a, b) => a.dayOffset - b.dayOffset),
    organic: [...input.organic, ...(topPest?.organic ?? [])].slice(0, 6),
    chemical:
      input.confidence >= 80 ? [...input.chemical, ...(topPest?.chemical ?? [])].slice(0, 6) : [],
    preventive: [
      ...input.prevention,
      ...(topPest?.prevention ?? []),
      ...(topNutrient?.prevention ?? []),
    ].slice(0, 6),
    safety: [
      "Wear a mask, gloves and full sleeves for any spray, even a natural one.",
      "Never spray while the crop is flowering in the middle of the day. It kills bees.",
      "Keep children and animals away from a sprayed field until the leaves are dry.",
      "Read the waiting period on the pack and do not harvest before it ends.",
      "Never mix two products unless the pack says you can.",
    ],
    ifIgnored: ifIgnored.length
      ? ifIgnored
      : ["Without action the problem usually gets worse over the next two weeks."],
  };
}
