/** Draws the analysed leaves onto the photo and builds the download files. */
import { clamp01, clampBox } from "./annotation-geometry";
import type { AnalysisResult } from "./demo-analysis";
import { summariseFruits, type FruitDiagnosis } from "./fruit-types";
import type { LeafDiagnosis } from "./leaf-types";

const COLOURS = {
  healthy: "#16a34a",
  diseased: "#dc2626",
  unknown: "#9ca3af",
};

export function leafColour(leaf: LeafDiagnosis) {
  if (leaf.status === "unclear") return COLOURS.unknown;
  return leaf.healthy ? COLOURS.healthy : COLOURS.diseased;
}

/** Photo with a coloured, numbered box (and outline when we have one) per leaf. */
export async function annotateImage(image: string, leaves: LeafDiagnosis[]): Promise<string> {
  const element = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = image;
  });
  const canvas = document.createElement("canvas");
  canvas.width = element.naturalWidth;
  canvas.height = element.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return image;
  ctx.drawImage(element, 0, 0);
  const unit = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) / 220));

  for (const leaf of leaves) {
    const colour = leafColour(leaf);
    // Clamp to the picture so no box, mask or label is drawn off the canvas.
    const box = clampBox(leaf.box);
    const x = box.x * canvas.width;
    const y = box.y * canvas.height;
    const w = box.w * canvas.width;
    const h = box.h * canvas.height;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.clip();

    if (leaf.mask && leaf.mask.length > 2) {
      ctx.beginPath();
      leaf.mask.forEach((point, index) => {
        const px = clamp01(point.x) * canvas.width;
        const py = clamp01(point.y) * canvas.height;
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = `${colour}33`;
      ctx.fill();
    }

    ctx.strokeStyle = colour;
    ctx.lineWidth = unit;
    // Inset by half the stroke so the outline itself stays inside the picture.
    const inset = unit / 2;
    ctx.strokeRect(
      Math.min(Math.max(x, inset), canvas.width - inset),
      Math.min(Math.max(y, inset), canvas.height - inset),
      Math.max(0, Math.min(w, canvas.width - x - inset)),
      Math.max(0, Math.min(h, canvas.height - y - inset)),
    );

    const label = `${leaf.index}`;
    ctx.font = `bold ${unit * 8}px sans-serif`;
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = colour;
    ctx.fillRect(x, y, textWidth + unit * 6, unit * 11);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x + unit * 3, y + unit * 8.5);
    ctx.restore();
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

function save(href: string, name: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadAnnotated(result: AnalysisResult) {
  const url = await annotateImage(result.image, [
    ...(result.leaves ?? []),
    ...fruitsAsLeaves(result.fruits ?? []),
  ]);
  save(url, `leafcheck-${result.id}.jpg`);
}

/** Fruits reuse the leaf drawing code so boxes and numbers look the same. */
function fruitsAsLeaves(fruits: FruitDiagnosis[]): LeafDiagnosis[] {
  return fruits.map((fruit) => ({
    index: fruit.index,
    box: fruit.box,
    ...(fruit.mask ? { mask: fruit.mask } : {}),
    plant: fruit.fruit,
    disease: fruit.disease,
    healthy: fruit.healthy,
    severity: fruit.severity,
    confidence: fruit.confidence,
    healthScore: fruit.healthScore,
    status: fruit.status,
    note: fruit.note,
    visibleSymptoms: fruit.visibleSymptoms,
    treatment: fruit.treatment,
    organic: fruit.organic,
    chemical: fruit.chemical,
    nextSteps: fruit.nextSteps,
    nutrients: [],
    pests: [],
  }));
}

/** Machine-readable report: every leaf with its box, disease and treatment. */
export function downloadJson(result: AnalysisResult) {
  const payload = {
    id: result.id,
    date: result.date,
    place: result.place ?? null,
    plant: result.plant,
    primaryDisease: result.disease,
    confidence: result.confidence,
    healthScore: result.healthScore ?? null,
    processingMs: result.timeMs,
    photoQuality: result.quality,
    leaves: (result.leaves ?? []).map((leaf) => ({
      leafNumber: leaf.index,
      status: leaf.status,
      plant: leaf.plant,
      disease: leaf.disease,
      healthy: leaf.healthy,
      severity: leaf.severity,
      confidence: leaf.confidence,
      healthScore: leaf.healthScore,
      boundingBox: leaf.box,
      segmentationMask: leaf.mask ?? null,
      visibleSymptoms: leaf.visibleSymptoms,
      treatment: leaf.treatment,
      organic: leaf.organic,
      chemical: leaf.chemical,
      nextSteps: leaf.nextSteps,
      nutrients: leaf.nutrients,
      pests: leaf.pests,
    })),
    fruitSummary: (result.fruits ?? []).length ? summariseFruits(result.fruits ?? []) : null,
    fruits: (result.fruits ?? []).map((fruit) => ({
      fruitNumber: fruit.index,
      status: fruit.status,
      fruit: fruit.fruit,
      disease: fruit.disease,
      healthy: fruit.healthy,
      severity: fruit.severity,
      confidence: fruit.confidence,
      healthScore: fruit.healthScore,
      quality: fruit.quality,
      marketability: fruit.marketability,
      ripeness: fruit.ripeness,
      defects: fruit.defects,
      boundingBox: fruit.box,
      segmentationMask: fruit.mask ?? null,
      hotspots: fruit.hotspots,
      visibleSymptoms: fruit.visibleSymptoms,
      causes: fruit.causes,
      treatment: fruit.treatment,
      organic: fruit.organic,
      chemical: fruit.chemical,
      prevention: fruit.prevention,
      nextSteps: fruit.nextSteps,
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  save(url, `leafcheck-${result.id}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** Spreadsheet report: one row per detected leaf. */
export function downloadCsv(result: AnalysisResult) {
  const header = [
    "kind",
    "number",
    "status",
    "plant",
    "disease",
    "healthy",
    "severity",
    "confidence",
    "health_score",
    "box_x",
    "box_y",
    "box_w",
    "box_h",
    "quality",
    "marketability",
    "ripeness",
    "symptoms",
    "treatment",
  ];
  const rows = (result.leaves ?? []).map((leaf) => {
    const box = clampBox(leaf.box);
    return [
      "leaf",
      leaf.index,
      leaf.status,
      leaf.plant,
      leaf.disease,
      leaf.healthy ? "yes" : "no",
      leaf.severity,
      leaf.confidence,
      leaf.healthScore,
      box.x.toFixed(4),
      box.y.toFixed(4),
      box.w.toFixed(4),
      box.h.toFixed(4),
      "",
      "",
      "",
      leaf.visibleSymptoms.join("; "),
      leaf.treatment.join("; "),
    ];
  });
  const fruitRows = (result.fruits ?? []).map((fruit) => {
    const box = clampBox(fruit.box);
    return [
      "fruit",
      fruit.index,
      fruit.status,
      fruit.fruit,
      fruit.disease,
      fruit.healthy ? "yes" : "no",
      fruit.severity,
      fruit.confidence,
      fruit.healthScore,
      box.x.toFixed(4),
      box.y.toFixed(4),
      box.w.toFixed(4),
      box.h.toFixed(4),
      fruit.quality,
      fruit.marketability,
      fruit.ripeness,
      [...fruit.defects, ...fruit.visibleSymptoms].join("; "),
      fruit.treatment.join("; "),
    ];
  });
  const csv = [header, ...rows, ...fruitRows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  save(url, `leafcheck-${result.id}.csv`);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
