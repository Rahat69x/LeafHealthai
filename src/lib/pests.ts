/**
 * Pest knowledge base.
 *
 * The vision model says which pest it can see and where. The control advice
 * comes from this file so the app never invents a pesticide instruction.
 */

export type PestKey =
  | "aphids"
  | "whiteflies"
  | "thrips"
  | "spider-mites"
  | "mealybugs"
  | "caterpillars"
  | "armyworms"
  | "leaf-miners"
  | "beetles"
  | "scale-insects";

export interface PestFact {
  key: PestKey;
  name: string;
  damage: string[];
  prevention: string[];
  organic: string[];
  /** General guidance only. We never give a dose without a local expert. */
  chemical: string[];
  monitoring: string[];
}

export const PESTS: Record<PestKey, PestFact> = {
  aphids: {
    key: "aphids",
    name: "Aphids",
    damage: [
      "Curled and sticky young leaves",
      "Black sooty mould on the sticky drops",
      "Plants grow slowly and can carry virus",
    ],
    prevention: [
      "Do not over feed with nitrogen",
      "Keep weeds down around the field",
      "Grow marigold or coriander nearby to pull in helpful insects",
    ],
    organic: [
      "Strong water spray to knock them off",
      "Neem oil spray every 5 to 7 days",
      "Soap water spray (5 g soap per litre) in the evening",
      "Protect ladybirds, they eat aphids",
    ],
    chemical: [
      "Only if more than a quarter of the plants are covered",
      "Systemic insecticides made for aphids are used in serious cases",
      "Never spray while the crop is flowering, it kills bees",
    ],
    monitoring: [
      "Check the underside of new leaves twice a week",
      "Use yellow sticky traps",
      "Look for ants, they farm aphids",
    ],
  },
  whiteflies: {
    key: "whiteflies",
    name: "Whiteflies",
    damage: [
      "Tiny white flies fly up when the plant is shaken",
      "Yellow speckled leaves",
      "Sticky leaves and sooty mould",
      "They spread leaf curl virus",
    ],
    prevention: [
      "Use yellow sticky traps early",
      "Remove infected plants fast",
      "Use a fine net over young plants",
    ],
    organic: [
      "Neem oil spray on the leaf underside",
      "Yellow sticky traps, 10 per 100 m²",
      "Soap water spray in the early morning",
    ],
    chemical: [
      "Whiteflies build resistance fast, rotate the product group",
      "Only spray if traps catch large numbers",
      "Follow the waiting time before harvest",
    ],
    monitoring: ["Shake plants each morning and count the flies", "Check trap counts weekly"],
  },
  thrips: {
    key: "thrips",
    name: "Thrips",
    damage: [
      "Silver or grey streaks on the leaf",
      "Tiny black dots (droppings) on the streaks",
      "Twisted new leaves and flower drop",
    ],
    prevention: [
      "Remove weeds that host thrips",
      "Use blue sticky traps",
      "Keep the crop well watered, dry stress makes it worse",
    ],
    organic: [
      "Neem oil spray",
      "Blue sticky traps",
      "Spinosad, a natural product, used in the evening",
    ],
    chemical: [
      "Thrips hide inside buds, sprays often miss them",
      "Use only on the advice of a local officer",
    ],
    monitoring: [
      "Tap a flower over white paper and look for moving specks",
      "Check blue traps twice a week",
    ],
  },
  "spider-mites": {
    key: "spider-mites",
    name: "Spider Mites",
    damage: [
      "Fine pale speckles all over the leaf",
      "Thin webbing under the leaf",
      "Leaves turn bronze and dry up",
    ],
    prevention: [
      "Keep humidity up, mites love hot dry air",
      "Wash dust off leaves",
      "Do not over spray broad insecticides, they kill mite predators",
    ],
    organic: [
      "Spray water under the leaves",
      "Neem or horticultural oil",
      "Sulphur dust in dry weather (not above 32°C)",
    ],
    chemical: [
      "Mites are not insects, normal insecticides do not work",
      "A specific miticide is needed, rotate products",
    ],
    monitoring: [
      "Check leaf undersides with a hand lens weekly",
      "Watch the hottest, dustiest edge of the field first",
    ],
  },
  mealybugs: {
    key: "mealybugs",
    name: "Mealybugs",
    damage: [
      "White cottony lumps in leaf joints",
      "Sticky leaves with sooty mould",
      "Yellowing and leaf drop",
    ],
    prevention: [
      "Check new plants before bringing them in",
      "Control ants, they carry mealybugs",
      "Prune crowded growth",
    ],
    organic: [
      "Wipe with a cloth dipped in soap water",
      "Neem oil spray every 7 days for 3 weeks",
      "Release or protect ladybird beetles",
    ],
    chemical: [
      "Their waxy coat blocks most sprays; oil must be added",
      "Use only for a heavy attack",
    ],
    monitoring: [
      "Look in leaf joints and under the stem weekly",
      "Follow ant trails to find hidden groups",
    ],
  },
  caterpillars: {
    key: "caterpillars",
    name: "Caterpillars",
    damage: [
      "Large holes chewed in leaves",
      "Dark droppings on leaves",
      "Whole young leaves eaten",
    ],
    prevention: [
      "Pick and destroy egg groups",
      "Deep plough after harvest to kill pupae",
      "Use pheromone traps",
    ],
    organic: [
      "Hand pick in the early morning",
      "Bt (Bacillus thuringiensis) spray, safe for people",
      "Neem spray on small caterpillars",
    ],
    chemical: [
      "Only when damage passes about 10% of leaves",
      "Spray in the evening when caterpillars feed",
    ],
    monitoring: ["Count damaged plants in 10 spots weekly", "Check pheromone traps"],
  },
  armyworms: {
    key: "armyworms",
    name: "Armyworms",
    damage: [
      "Ragged windows chewed in leaves",
      "Moist sawdust like droppings in the plant whorl",
      "Damage moves fast across the field",
    ],
    prevention: [
      "Plant early and all at once",
      "Deep plough between seasons",
      "Keep field edges clean",
    ],
    organic: [
      "Hand pick from the whorl",
      "Bt or spinosad into the whorl",
      "Sand and ash mix poured into the whorl of maize",
    ],
    chemical: [
      "Treat while worms are small; big worms are hard to kill",
      "Direct the spray into the whorl in the evening",
    ],
    monitoring: ["Check 20 plants in 5 places each week", "Act at 5% damaged plants in young crop"],
  },
  "leaf-miners": {
    key: "leaf-miners",
    name: "Leaf Miners",
    damage: [
      "White winding tunnels inside the leaf",
      "Leaves dry out when tunnels join",
      "Less yield in leafy crops",
    ],
    prevention: [
      "Remove and burn mined leaves",
      "Yellow sticky traps for the adult flies",
      "Rotate crops",
    ],
    organic: [
      "Pick off mined leaves early",
      "Neem spray stops egg laying",
      "Protect parasitic wasps, they control miners well",
    ],
    chemical: [
      "The larva sits inside the leaf, contact sprays fail",
      "Only a systemic product works, use with expert advice",
    ],
    monitoring: [
      "Count mined leaves on 10 plants weekly",
      "Watch yellow traps for the small flies",
    ],
  },
  beetles: {
    key: "beetles",
    name: "Beetles",
    damage: [
      "Round holes eaten in leaves",
      "Leaves skeletonised, only veins left",
      "Beetles visible on the leaf in daylight",
    ],
    prevention: [
      "Deep plough to expose grubs",
      "Use trap crops at the field edge",
      "Clear crop waste after harvest",
    ],
    organic: [
      "Hand pick into soapy water in the morning",
      "Neem spray",
      "Light traps at night for adults",
    ],
    chemical: [
      "Spot spray heavily attacked areas only",
      "Avoid whole field sprays that kill pollinators",
    ],
    monitoring: [
      "Walk the field in the early morning weekly",
      "Check the field border first, beetles come from there",
    ],
  },
  "scale-insects": {
    key: "scale-insects",
    name: "Scale Insects",
    damage: [
      "Hard brown bumps stuck along stems and veins",
      "Yellow patches and leaf drop",
      "Sticky honeydew with sooty mould",
    ],
    prevention: ["Prune and burn heavily covered branches", "Control ants", "Do not crowd plants"],
    organic: [
      "Scrape off with a soft brush",
      "Horticultural oil spray to smother them",
      "Neem oil during the crawler stage",
    ],
    chemical: [
      "The hard shell blocks sprays; only crawlers can be hit",
      "Time any spray to the crawler stage with expert help",
    ],
    monitoring: [
      "Check stems and leaf veins monthly",
      "Put sticky tape on a branch to catch crawlers",
    ],
  },
};

export const PEST_KEYS = Object.keys(PESTS) as PestKey[];

export interface PestFinding {
  key: PestKey;
  name: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  /** Plain words for where on the leaf the pest or its damage was seen. */
  regions: string[];
  /** What the AI actually saw in this photo. */
  evidence: string[];
  damage: string[];
  prevention: string[];
  organic: string[];
  chemical: string[];
  monitoring: string[];
}

/** Below this we do not name a pest. */
export const MIN_PEST_CONFIDENCE = 60;
/** Below this we hide the chemical guidance, same rule as diseases. */
export const PEST_CHEMICAL_CONFIDENCE = 80;

function matchPest(raw: unknown): PestKey | null {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!value) return null;
  const alias: Record<string, PestKey> = {
    aphid: "aphids",
    whitefly: "whiteflies",
    "white fly": "whiteflies",
    thrip: "thrips",
    mite: "spider-mites",
    "red spider": "spider-mites",
    mealy: "mealybugs",
    caterpillar: "caterpillars",
    "leaf worm": "caterpillars",
    borer: "caterpillars",
    armyworm: "armyworms",
    "army worm": "armyworms",
    miner: "leaf-miners",
    beetle: "beetles",
    weevil: "beetles",
    scale: "scale-insects",
  };
  for (const [key, mapped] of Object.entries(alias)) {
    if (value.includes(key)) return mapped;
  }
  return PEST_KEYS.find((key) => value.includes(key.replace("-", " "))) ?? null;
}

function strings(value: unknown, max = 4): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, max);
}

/** Turns raw model output into trusted pest findings, one entry per pest. */
export function normalisePests(raw: unknown): PestFinding[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<PestKey>();
  const out: PestFinding[] = [];

  for (const item of raw) {
    const key = matchPest((item as { pest?: unknown })?.pest ?? (item as { name?: unknown })?.name);
    if (!key || seen.has(key)) continue;
    const confidence = Math.max(
      0,
      Math.min(100, Math.round(Number((item as { confidence?: unknown })?.confidence) || 0)),
    );
    if (confidence < MIN_PEST_CONFIDENCE) continue;
    seen.add(key);
    const fact = PESTS[key];
    const severity = (item as { severity?: unknown })?.severity;
    out.push({
      key,
      name: fact.name,
      confidence,
      severity: severity === "High" || severity === "Medium" ? severity : "Low",
      regions: strings((item as { regions?: unknown })?.regions),
      evidence: strings((item as { evidence?: unknown })?.evidence),
      damage: fact.damage,
      prevention: fact.prevention,
      organic: fact.organic,
      chemical: confidence >= PEST_CHEMICAL_CONFIDENCE ? fact.chemical : [],
      monitoring: fact.monitoring,
    });
    if (out.length >= 4) break;
  }

  return out.sort((a, b) => b.confidence - a.confidence);
}
