/**
 * Nutrient deficiency knowledge base.
 *
 * The AI reports which nutrient it suspects and why. This file holds the
 * agronomy facts (what to feed, organic options, prevention, recovery time)
 * so the model never has to invent fertiliser advice.
 */

export type NutrientCode = "N" | "P" | "K" | "Ca" | "Mg" | "S" | "Fe" | "Zn" | "Mn" | "B";

export interface NutrientFact {
  code: NutrientCode;
  name: string;
  /** Where the marks usually start. Old leaves = mobile nutrient. */
  where: string;
  symptoms: string[];
  fertiliser: string[];
  organic: string[];
  prevention: string[];
  /** How long until new leaves look better if the farmer acts now. */
  recovery: string;
  /** Disease look-alikes we must not confuse with a deficiency. */
  notToConfuseWith: string;
}

export const NUTRIENTS: Record<NutrientCode, NutrientFact> = {
  N: {
    code: "N",
    name: "Nitrogen (N)",
    where: "Starts on the oldest, lowest leaves.",
    symptoms: [
      "Whole leaf turns pale green then yellow, evenly",
      "Old leaves yellow first while new leaves stay green",
      "Plant is small and grows slowly",
    ],
    fertiliser: [
      "Urea or ammonium sulphate as a light top dressing",
      "Split the dose: half now, half in 2 weeks",
    ],
    organic: [
      "Well rotted cow manure or compost",
      "Mustard or oil cake soaked in water",
      "Grow a legume crop next season",
    ],
    prevention: [
      "Feed in small amounts more often",
      "Add compost before planting",
      "Do not over water, it washes nitrogen away",
    ],
    recovery: "New leaves should turn greener in 7 to 14 days.",
    notToConfuseWith: "Old-age yellowing and root rot also yellow the lower leaves.",
  },
  P: {
    code: "P",
    name: "Phosphorus (P)",
    where: "Old leaves first.",
    symptoms: [
      "Dark dull green leaves",
      "Purple or reddish colour on leaf backs and stems",
      "Small leaves, few flowers, late maturity",
    ],
    fertiliser: [
      "Single super phosphate or DAP worked into the soil near the roots",
      "Check soil pH: below 5.5 locks up phosphorus",
    ],
    organic: ["Bone meal", "Rock phosphate mixed with compost", "Well made farmyard manure"],
    prevention: [
      "Apply phosphorus at planting, it moves very little in soil",
      "Keep soil pH between 6 and 7",
      "Avoid cold waterlogged soil",
    ],
    recovery: "Colour improves slowly, 2 to 3 weeks. Growth catches up later.",
    notToConfuseWith: "Cold nights also turn stems purple for a few days.",
  },
  K: {
    code: "K",
    name: "Potassium (K)",
    where: "Old leaves first, always at the edges.",
    symptoms: [
      "Leaf edges turn yellow then brown and dry (scorched rim)",
      "Middle of the leaf stays green",
      "Weak stems, small fruit",
    ],
    fertiliser: [
      "Muriate of potash (MOP) or sulphate of potash",
      "Split into two doses around flowering",
    ],
    organic: [
      "Wood ash, a light dusting only",
      "Banana peel or compost rich in crop waste",
      "Seaweed extract spray",
    ],
    prevention: [
      "Feed potash before flowering and fruiting",
      "Do not over use nitrogen alone",
      "Keep soil moist, dry soil blocks uptake",
    ],
    recovery: "Old burnt edges will not heal. New leaves should be clean in 10 to 14 days.",
    notToConfuseWith: "Salt damage and leaf blight also burn leaf edges.",
  },
  Ca: {
    code: "Ca",
    name: "Calcium (Ca)",
    where: "New leaves and growing tips.",
    symptoms: [
      "New leaves hooked, twisted or with dead tips",
      "Growing point dies back",
      "Blossom end rot on tomato and pepper fruit",
    ],
    fertiliser: [
      "Agricultural lime or gypsum in the soil",
      "Calcium nitrate spray for a quick fix",
    ],
    organic: [
      "Crushed eggshell powder worked into soil",
      "Wood ash in small amounts",
      "Compost with bone meal",
    ],
    prevention: [
      "Keep watering even, calcium moves with water",
      "Do not over use potash or ammonium",
      "Mulch to hold soil moisture",
    ],
    recovery: "New growth improves in 7 to 10 days if watering stays even.",
    notToConfuseWith: "Boron shortage and mite damage also twist new leaves.",
  },
  Mg: {
    code: "Mg",
    name: "Magnesium (Mg)",
    where: "Old leaves first.",
    symptoms: [
      "Yellow between the veins while the veins stay green",
      "Leaf looks like a green net on a yellow cloth",
      "Older leaves may turn red or drop",
    ],
    fertiliser: [
      "Epsom salt (magnesium sulphate) 10 g per litre as a leaf spray",
      "Dolomite lime in the soil for the long term",
    ],
    organic: ["Dolomite lime", "Compost with plenty of leaf litter"],
    prevention: [
      "Do not over use potash, it blocks magnesium",
      "Test soil every season",
      "Keep pH near 6.5",
    ],
    recovery: "Leaf spray shows a change in 5 to 7 days.",
    notToConfuseWith:
      "Virus mosaic also makes a yellow and green pattern, but it is patchy and uneven.",
  },
  S: {
    code: "S",
    name: "Sulfur (S)",
    where: "New leaves first.",
    symptoms: [
      "Young leaves turn pale yellow all over",
      "Whole plant looks light green",
      "Slow, thin growth",
    ],
    fertiliser: ["Ammonium sulphate or gypsum", "Elemental sulphur for alkaline soil"],
    organic: ["Compost and farmyard manure", "Mustard cake"],
    prevention: ["Use sulphur bearing fertilisers now and then", "Add organic matter every season"],
    recovery: "Colour returns in about 2 weeks.",
    notToConfuseWith: "Nitrogen shortage looks the same but starts on OLD leaves, not new ones.",
  },
  Fe: {
    code: "Fe",
    name: "Iron (Fe)",
    where: "Newest leaves at the top.",
    symptoms: [
      "Bright yellow young leaves with thin sharp green veins",
      "Older leaves stay green",
      "Severe cases turn leaves almost white",
    ],
    fertiliser: ["Chelated iron (Fe-EDDHA) as a leaf spray or through drip"],
    organic: ["Compost to lower soil pH slowly", "Elemental sulphur to correct alkaline soil"],
    prevention: [
      "Fix drainage, wet soil blocks iron",
      "Do not over lime the field",
      "Keep pH under 7",
    ],
    recovery: "Leaf spray greens new leaves in 7 to 10 days.",
    notToConfuseWith: "Manganese shortage looks similar, but the veins are less sharp.",
  },
  Zn: {
    code: "Zn",
    name: "Zinc (Zn)",
    where: "New and middle leaves.",
    symptoms: [
      "Small narrow leaves bunched at the top",
      "Short space between leaves",
      "Pale bands beside the mid rib",
    ],
    fertiliser: ["Zinc sulphate 5 g per litre leaf spray, or 20 to 25 kg per hectare in soil"],
    organic: ["Farmyard manure", "Compost made with crop residue"],
    prevention: [
      "Do not over use phosphorus, it blocks zinc",
      "Common in high pH and sandy soil, test before planting",
    ],
    recovery: "New leaves come back to normal size in 10 to 15 days.",
    notToConfuseWith: "Herbicide drift also shrinks and twists new leaves.",
  },
  Mn: {
    code: "Mn",
    name: "Manganese (Mn)",
    where: "Younger leaves.",
    symptoms: [
      "Yellow between the veins with a soft, blurred edge",
      "Small dead brown specks in the yellow area",
      "Veins stay green but look wide",
    ],
    fertiliser: ["Manganese sulphate 2 to 4 g per litre as a leaf spray"],
    organic: ["Compost", "Sulphur to lower pH in alkaline soil"],
    prevention: ["Avoid over liming", "Improve drainage", "Test soil pH each season"],
    recovery: "Spray shows improvement in about 1 week.",
    notToConfuseWith: "Iron shortage is brighter yellow with very sharp thin veins.",
  },
  B: {
    code: "B",
    name: "Boron (B)",
    where: "Growing tips, flowers and fruit.",
    symptoms: [
      "Brittle, thick, curled new leaves",
      "Growing tip dies",
      "Cracked stems, hollow or corky fruit",
    ],
    fertiliser: [
      "Borax 1 to 2 g per litre as a leaf spray. Use the exact amount, too much boron is poison.",
    ],
    organic: ["Compost", "Seaweed extract"],
    prevention: [
      "Keep soil moist, dry soil blocks boron",
      "Never apply boron twice in one season without a soil test",
    ],
    recovery: "New growth improves in 7 to 14 days. Damaged tips will not heal.",
    notToConfuseWith: "Calcium shortage also kills the growing tip.",
  },
};

export const NUTRIENT_CODES = Object.keys(NUTRIENTS) as NutrientCode[];

export interface NutrientFinding {
  code: NutrientCode;
  name: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  /** What the AI actually saw on this leaf. */
  visualSymptoms: string[];
  /** Why the AI thinks it is this nutrient and not another one. */
  reasoning: string[];
  fertiliser: string[];
  organic: string[];
  prevention: string[];
  recovery: string;
  notToConfuseWith: string;
}

/** Lowest confidence we will name a nutrient at. Below this we say we are not sure. */
export const MIN_NUTRIENT_CONFIDENCE = 60;

function severityOf(value: unknown): "Low" | "Medium" | "High" {
  return value === "High" || value === "Medium" ? value : "Low";
}

function strings(value: unknown, max = 5): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, max);
}

function matchCode(raw: unknown): NutrientCode | null {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!value) return null;
  const direct = NUTRIENT_CODES.find((code) => code.toLowerCase() === value);
  if (direct) return direct;
  const byName: Record<string, NutrientCode> = {
    nitrogen: "N",
    phosphorus: "P",
    phosphorous: "P",
    potassium: "K",
    potash: "K",
    calcium: "Ca",
    magnesium: "Mg",
    sulfur: "S",
    sulphur: "S",
    iron: "Fe",
    zinc: "Zn",
    manganese: "Mn",
    boron: "B",
  };
  for (const [key, code] of Object.entries(byName)) {
    if (value.includes(key)) return code;
  }
  return null;
}

/** Turns raw model output into trusted findings joined with our agronomy notes. */
export function normaliseNutrients(raw: unknown): NutrientFinding[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<NutrientCode>();
  const out: NutrientFinding[] = [];

  for (const item of raw) {
    const code = matchCode(
      (item as { nutrient?: unknown })?.nutrient ?? (item as { code?: unknown })?.code,
    );
    if (!code || seen.has(code)) continue;
    const confidence = Math.max(
      0,
      Math.min(100, Math.round(Number((item as { confidence?: unknown })?.confidence) || 0)),
    );
    if (confidence < MIN_NUTRIENT_CONFIDENCE) continue;
    seen.add(code);
    const fact = NUTRIENTS[code];
    out.push({
      code,
      name: fact.name,
      confidence,
      severity: severityOf((item as { severity?: unknown })?.severity),
      visualSymptoms: strings((item as { visualSymptoms?: unknown })?.visualSymptoms).length
        ? strings((item as { visualSymptoms?: unknown })?.visualSymptoms)
        : fact.symptoms.slice(0, 2),
      reasoning: strings((item as { reasoning?: unknown })?.reasoning),
      fertiliser: fact.fertiliser,
      organic: fact.organic,
      prevention: fact.prevention,
      recovery: fact.recovery,
      notToConfuseWith: fact.notToConfuseWith,
    });
    if (out.length >= 3) break;
  }

  return out.sort((a, b) => b.confidence - a.confidence);
}
