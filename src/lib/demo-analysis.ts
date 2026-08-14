import type { LeafDiagnosis } from "./diagnose.functions";
import type { FruitDiagnosis } from "./fruit-types";
import type { ImageCheck } from "./leaf-image-validation";
import type { NutrientFinding } from "./nutrients";
import type { PestFinding } from "./pests";

export interface DiseaseInfo {
  plant: string;
  disease: string;
  healthy: boolean;
  severity: "Low" | "Medium" | "High";
  about: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  organic: string[];
  chemical: string[];
  prevention: string[];
  practices: string[];
  recovery: string[];
  nextSteps: string[];
  /** What a healthy leaf of this plant looks like, for the side by side check. */
  healthyLook: string[];
}

export interface Prediction {
  disease: string;
  plant: string;
  confidence: number;
}

export interface Hotspot {
  x: number;
  y: number;
  r: number;
  /** Plain name of what the AI saw here, e.g. "Brown circular lesion". */
  label?: string;
  /** 0-1, how strongly this area pushed the answer. */
  intensity?: number;
}

export interface AnalysisResult extends DiseaseInfo {
  id: string;
  confidence: number;
  date: string;
  image: string;
  quality: string;
  /** Top 3 possible answers, best first. */
  predictions: Prediction[];
  /** Where the check found marks, as 0-1 positions on the photo. */
  hotspots: Hotspot[];
  timeMs: number;
  feedback?: "yes" | "no";
  place?: string;
  /** 0-100 overall leaf health, from the AI pipeline. */
  healthScore?: number;
  /** Name the user gave this plant so scans can be followed over time. */
  plantTag?: string;
  /** Visual patterns the AI used to decide (explainability). */
  visualPatterns?: string[];
  /** Why the AI decided this (explainability). */
  reasoning?: string[];
  /** What the AI could actually see in the photo. */
  visibleSymptoms?: string[];
  /** Nutrient shortages found on the leaf. */
  nutrients?: NutrientFinding[];
  /** Insect pests found on the leaf. */
  pests?: PestFinding[];
  /** One entry per leaf found in the photo when the photo holds many leaves. */
  leaves?: LeafDiagnosis[];
  /** One entry per fruit found in the photo. */
  fruits?: FruitDiagnosis[];
  /** Soft warning, e.g. some leaves could not be analysed. */
  notice?: string | undefined;
  /** "ai" for a real model answer, "demo" for the offline fallback. */
  source?: "ai" | "demo";
  /** True while the scan waits for the internet to come back. */
  pending?: boolean;
  syncedAt?: string;
}

/** Simple, easy to read plant and disease notes used by the whole app. */
export const DISEASES: DiseaseInfo[] = [
  {
    plant: "Tomato",
    disease: "Early Blight",
    healthy: false,
    severity: "Medium",
    about:
      "A common leaf sickness caused by a fungus. It starts on older leaves near the ground and slowly moves up the plant.",
    symptoms: [
      "Brown spots with rings inside",
      "Yellow colour around the spots",
      "Older leaves dry and fall off",
    ],
    causes: [
      "Warm and wet weather",
      "Water splashing soil onto leaves",
      "Leaves staying wet for a long time",
    ],
    treatment: [
      "Cut off the sick leaves and throw them away from the plant.",
      "Spray in the evening when the sun is low.",
      "Spray again after 7 to 10 days if new spots come.",
    ],
    organic: [
      "Neem oil spray every 7 days",
      "Baking soda and soap water spray",
      "Compost tea on the soil",
    ],
    chemical: [
      "Copper based spray",
      "Mancozeb, as written on the pack",
      "Stop spraying 7 days before picking fruit",
    ],
    prevention: [
      "Water the soil, not the leaves",
      "Leave space between plants for air",
      "Put dry grass or straw on the soil",
    ],
    practices: [
      "Change the planting spot each year",
      "Clean your tools after use",
      "Remove old plant waste from the field",
    ],
    recovery: [
      "New leaves should look clean in 2 weeks",
      "Check the plant every 3 days",
      "Give the plant balanced food",
    ],
    nextSteps: [
      "Remove the marked leaves today.",
      "Keep the leaves dry.",
      "Take a new photo in 5 days.",
    ],
    healthyLook: ["Even green colour", "Flat surface with no rings", "Strong stem and full leaves"],
  },
  {
    plant: "Potato",
    disease: "Late Blight",
    healthy: false,
    severity: "High",
    about:
      "A fast moving leaf sickness. It can damage a whole field in a few days when the weather is cool and wet.",
    symptoms: [
      "Dark wet looking patches",
      "White fuzzy growth under the leaf",
      "Leaves turn black and rot",
    ],
    causes: ["Cool nights with heavy dew", "Rain and high humidity", "Sick plants nearby"],
    treatment: [
      "Remove and burn the sick plants right away.",
      "Spray as soon as you see the first spots.",
      "Check the field every day for one week.",
    ],
    organic: ["Copper soap spray", "Remove and burn sick plants", "Wider spacing for air flow"],
    chemical: [
      "Chlorothalonil spray",
      "Metalaxyl mix for heavy attacks",
      "Follow the pack for the safe amount",
    ],
    prevention: [
      "Plant healthy seed only",
      "Keep rows wide and airy",
      "Do not water late in the day",
    ],
    practices: [
      "Use blight resistant types",
      "Hill the soil around the stems",
      "Harvest in dry weather",
    ],
    recovery: [
      "Stop the spread first, then feed the plant",
      "Watch new growth for 10 days",
      "Throw away badly hit plants",
    ],
    nextSteps: [
      "Pull out badly hit plants now.",
      "Do not water at night.",
      "Check again tomorrow.",
    ],
    healthyLook: ["Firm green leaves", "No wet dark patches", "Dry underside with no fuzz"],
  },
  {
    plant: "Grape",
    disease: "Leaf Blight",
    healthy: false,
    severity: "Medium",
    about: "Brown dry patches on grape leaves caused by a fungus that likes warm and wet air.",
    symptoms: ["Dry brown patches", "Edges of leaves look burnt", "Leaves fall early"],
    causes: ["Long wet weather", "Crowded vines", "Poor air flow"],
    treatment: [
      "Cut the worst leaves off",
      "Spray a fungus spray made for grapes",
      "Repeat after 10 days if needed",
    ],
    organic: ["Neem oil spray", "Sulphur dust in dry weather", "Open the vine by trimming"],
    chemical: ["Copper oxychloride spray", "Mancozeb before the rains", "Keep to the pack amount"],
    prevention: ["Trim the vine so air can pass", "Keep the ground clean", "Water at the roots"],
    practices: [
      "Tie vines up off the ground",
      "Remove fallen leaves",
      "Feed the vine before the rainy season",
    ],
    recovery: ["New leaves grow clean in 2 to 3 weeks", "Do not over water", "Check weekly"],
    nextSteps: [
      "Trim crowded shoots today.",
      "Clear fallen leaves.",
      "Take a new photo in 1 week.",
    ],
    healthyLook: ["Bright green leaves", "Whole edges with no burn", "Leaves stay on the vine"],
  },
  {
    plant: "Corn",
    disease: "Leaf Spot",
    healthy: false,
    severity: "Low",
    about: "Small grey or brown spots on corn leaves. It is mild at the start and easy to control.",
    symptoms: ["Small long grey spots", "Spots join into bigger marks", "Lower leaves dry first"],
    causes: ["Wet leaves for many hours", "Old crop waste left in the field", "Planting too close"],
    treatment: [
      "Remove badly marked lower leaves",
      "Spray only if many leaves are hit",
      "Keep the field free of weeds",
    ],
    organic: ["Remove old crop waste", "Wider row spacing", "Compost to feed the soil"],
    chemical: ["Propiconazole spray if it spreads fast", "Only spray when many leaves are hit"],
    prevention: [
      "Rotate the crop every year",
      "Plant with good spacing",
      "Clear old stalks after harvest",
    ],
    practices: ["Use strong seed types", "Add balanced fertiliser", "Water in the morning"],
    recovery: [
      "The plant usually keeps growing well",
      "Watch the top leaves",
      "Check again in 1 week",
    ],
    nextSteps: [
      "Pull weeds around the plants.",
      "Water in the morning only.",
      "Check the top leaves in 1 week.",
    ],
    healthyLook: ["Long even green leaves", "No grey marks", "Upright and firm"],
  },
  {
    plant: "Apple",
    disease: "Apple Scab",
    healthy: false,
    severity: "Medium",
    about:
      "A fungus that makes rough dark marks on leaves and fruit. It is most common in spring rain.",
    symptoms: ["Olive green or black marks", "Leaves twist and curl", "Early leaf fall"],
    causes: ["Wet spring weather", "Old infected leaves on the ground", "Thick tree canopy"],
    treatment: [
      "Pick and remove marked leaves",
      "Spray in early spring",
      "Repeat after heavy rain",
    ],
    organic: [
      "Rake and burn fallen leaves",
      "Sulphur spray in early spring",
      "Open the tree by pruning",
    ],
    chemical: [
      "Captan spray",
      "Myclobutanil for heavy years",
      "Follow the waiting time on the pack",
    ],
    prevention: [
      "Rake and remove fallen leaves",
      "Prune to open the tree",
      "Avoid overhead watering",
    ],
    practices: [
      "Plant scab resistant types",
      "Feed the tree in early spring",
      "Keep the base clean",
    ],
    recovery: [
      "The tree recovers over the season",
      "Check new leaves each week",
      "Do not over prune",
    ],
    nextSteps: ["Rake fallen leaves today.", "Prune crowded branches.", "Check new leaves weekly."],
    healthyLook: ["Smooth green leaves", "No black rough marks", "Leaves hold on the branch"],
  },
  {
    plant: "Rice",
    disease: "Leaf Blast",
    healthy: false,
    severity: "High",
    about:
      "A fungus problem in rice. It makes eye shaped marks and can cut the harvest if it spreads.",
    symptoms: ["Eye shaped grey marks", "Brown edge around the mark", "Leaves dry from the tip"],
    causes: ["Long dew at night", "Too much nitrogen fertiliser", "Close planting"],
    treatment: ["Drain the field a little", "Stop extra nitrogen", "Spray an approved blast spray"],
    organic: ["Balanced compost instead of extra urea", "Wider spacing", "Use resistant seed"],
    chemical: ["Tricyclazole spray", "Isoprothiolane spray", "Use the amount on the pack only"],
    prevention: ["Use clean seed", "Keep water level steady", "Do not over feed with urea"],
    practices: ["Plant in lines", "Remove weeds", "Check the field weekly"],
    recovery: [
      "New leaves come clean in 2 weeks",
      "Feed with potash",
      "Watch the neck of the plant",
    ],
    nextSteps: [
      "Stop extra urea now.",
      "Check the field every 2 days.",
      "Spray only if marks spread.",
    ],
    healthyLook: ["Straight green blades", "No eye shaped marks", "Green from tip to base"],
  },
  {
    plant: "Wheat",
    disease: "Leaf Rust",
    healthy: false,
    severity: "Medium",
    about: "Small orange brown dust like spots on wheat leaves. The dust rubs off on your hand.",
    symptoms: ["Orange brown dust spots", "Spots on the top of the leaf", "Leaves dry early"],
    causes: ["Warm humid days", "Late planting", "Rust from nearby fields"],
    treatment: ["Spray at the first sign", "Remove weak plants", "Keep the field weed free"],
    organic: ["Use rust resistant seed", "Plant on time", "Balanced feeding"],
    chemical: ["Propiconazole spray", "Tebuconazole spray", "Repeat only if the pack allows"],
    prevention: ["Plant early", "Use clean certified seed", "Do not over water"],
    practices: ["Rotate crops", "Remove volunteer wheat", "Check fields weekly"],
    recovery: ["Green colour returns in 2 weeks", "Feed lightly", "Watch the flag leaf"],
    nextSteps: ["Check the top leaf today.", "Remove weeds.", "Take a new photo in 1 week."],
    healthyLook: ["Clean green blades", "No orange dust", "Firm upright leaves"],
  },
  {
    plant: "Tomato",
    disease: "Healthy Leaf",
    healthy: true,
    severity: "Low",
    about:
      "This leaf looks healthy. The colour and shape look normal and there are no clear signs of disease.",
    symptoms: ["Even green colour", "No spots or holes", "Firm and flat surface"],
    causes: ["Good light", "Good watering", "Healthy soil"],
    treatment: ["No treatment needed right now."],
    organic: ["Keep adding compost", "Mulch the soil", "Water at the base"],
    chemical: ["No spray needed."],
    prevention: [
      "Keep watering at the base",
      "Keep good space between plants",
      "Check the plants weekly",
    ],
    practices: ["Feed the plant every 2 weeks", "Remove weeds", "Add mulch to hold water"],
    recovery: [
      "Keep doing what you are doing",
      "Take a new photo in 1 week",
      "Watch the lower leaves",
    ],
    nextSteps: ["No action needed today.", "Keep watering at the base.", "Check again in 1 week."],
    healthyLook: ["Even green colour", "No spots or holes", "Firm and flat surface"],
  },
];

function pseudo(seed: number, index: number) {
  const value = Math.sin(seed * (index + 1) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** Picks a stable demo result from the photo's own numbers. */
export function analyseDemo(check: ImageCheck, timeMs = 0): AnalysisResult {
  const m = check.metrics;
  const seed = Math.round(
    m.brightness * 7 + m.sharpness * 3 + m.leafCover * 977 + m.colorMix * 613,
  );
  const healthyLooking = m.colorMix > 0.34 && m.brightness > 95 && m.sharpness > 120;
  const sick = DISEASES.filter((item) => !item.healthy);
  const info = healthyLooking
    ? (DISEASES.find((item) => item.healthy) as DiseaseInfo)
    : (sick[seed % sick.length] as DiseaseInfo);

  const base = 62 + (check.score / 100) * 34;
  const confidence = Math.max(52, Math.min(98, Math.round(base + (seed % 5))));

  const others = DISEASES.filter(
    (item) => item.disease !== info.disease && item.healthy === info.healthy,
  )
    .concat(DISEASES.filter((item) => item.healthy !== info.healthy))
    .slice(0, 2);

  const predictions: Prediction[] = [
    { disease: info.disease, plant: info.plant, confidence },
    ...others.map((item, index) => ({
      disease: item.disease,
      plant: item.plant,
      confidence: Math.max(8, confidence - 11 - index * 9 - (seed % 4)),
    })),
  ];

  const spotCount = info.healthy ? 0 : 3 + (seed % 3);
  const hotspots: Hotspot[] = Array.from({ length: spotCount }, (_, index) => ({
    x: 0.22 + pseudo(seed, index) * 0.56,
    y: 0.2 + pseudo(seed + 31, index) * 0.58,
    r: 0.06 + pseudo(seed + 77, index) * 0.09,
  }));

  return {
    ...info,
    id: `${Date.now()}-${seed % 9973}`,
    confidence,
    date: new Date().toISOString(),
    image: check.preview,
    quality: check.grade,
    predictions,
    hotspots,
    timeMs,
  };
}

export function confidenceLabel(confidence: number) {
  if (confidence > 90) return { label: "High confidence", tone: "high" as const };
  if (confidence >= 70) return { label: "Good confidence", tone: "good" as const };
  return { label: "Low confidence", tone: "low" as const };
}

export function plantList() {
  return Array.from(new Set(DISEASES.map((item) => item.plant))).sort();
}

export function searchDiseases(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return DISEASES;
  return DISEASES.filter((item) =>
    [item.plant, item.disease, item.about, ...item.symptoms].join(" ").toLowerCase().includes(q),
  );
}
