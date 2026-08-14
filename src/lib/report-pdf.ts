import { summariseFruits } from "./fruit-types";
import { summariseLeaves } from "@/lib/leaf-types";
import type { AnalysisResult } from "./demo-analysis";
import { confidenceLabel } from "./demo-analysis";
import { formatWhen } from "./history";

const MARGIN = 44;

// jsPDF is ~350 kB, so it is only fetched when someone asks for a report.
export async function downloadReport(result: AnalysisResult) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const width = pageWidth - MARGIN * 2;
  let y = MARGIN;

  const when = formatWhen(result.date);

  const nextPageIfNeeded = (needed: number) => {
    if (y + needed > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  doc.setFillColor(29, 61, 44);
  doc.rect(0, 0, pageWidth, 86, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Leaf Health Report", MARGIN, 46);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${when.date} at ${when.time}`, MARGIN, 66);
  y = 118;

  doc.setTextColor(20, 20, 20);

  if (result.image) {
    try {
      const imgWidth = 200;
      const imgHeight = 150;
      doc.addImage(result.image, "JPEG", MARGIN, y, imgWidth, imgHeight, undefined, "FAST");
      const infoX = MARGIN + imgWidth + 20;
      let infoY = y + 14;
      const rows: [string, string][] = [
        ["Plant", result.plant],
        ["Result", result.disease],
        ["Status", result.healthy ? "Healthy" : "Diseased"],
        ["Confidence", `${result.confidence}% (${confidenceLabel(result.confidence).label})`],
        ["Severity", result.severity],
        ["Photo quality", result.quality],
        ["Time taken", result.timeMs ? `${(result.timeMs / 1000).toFixed(1)} seconds` : "-"],
      ];
      rows.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(label, infoX, infoY);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), infoX + 80, infoY);
        infoY += 22;
      });
      y += imgHeight + 26;
    } catch {
      y += 10;
    }
  }

  const section = (title: string, lines: string[]) => {
    nextPageIfNeeded(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(29, 61, 44);
    doc.text(title, MARGIN, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(`- ${line}`, width) as string[];
      nextPageIfNeeded(wrapped.length * 14 + 6);
      doc.text(wrapped, MARGIN, y);
      y += wrapped.length * 14;
    });
    y += 12;
  };

  if ((result.leaves?.length ?? 0) > 1) {
    const leaves = result.leaves ?? [];
    const summary = summariseLeaves(leaves);
    section("Every leaf in this photo", [
      `Total leaves: ${summary.total} · Healthy: ${summary.healthy} · Needs care: ${summary.diseased} · Not clear: ${summary.skipped}`,
      `Plant health score: ${summary.healthScore}/100 · Average confidence: ${summary.avgConfidence}%`,
      ...leaves.map((leaf) =>
        leaf.status === "unclear"
          ? `Leaf ${leaf.index}: could not be read — ${leaf.note}`
          : `Leaf ${leaf.index}: ${leaf.plant} · ${leaf.disease} · ${leaf.confidence}% · ${leaf.severity}`,
      ),
    ]);
  }

  if ((result.fruits?.length ?? 0) > 0) {
    const fruits = result.fruits ?? [];
    const fruitSummary = summariseFruits(fruits);
    section("Every fruit in this photo", [
      `Total fruits: ${fruitSummary.total} · Healthy: ${fruitSummary.healthy} · Diseased: ${fruitSummary.diseased} · Not clear: ${fruitSummary.skipped}`,
      `Fruit health score: ${fruitSummary.healthScore}/100 · Average confidence: ${fruitSummary.avgConfidence}% · Average severity: ${fruitSummary.avgSeverity}/3`,
      `Market ready: ${fruitSummary.marketReady} of ${fruitSummary.total}`,
      ...fruits.map((fruit) =>
        fruit.status === "unclear"
          ? `Fruit ${fruit.index}: could not be read — ${fruit.note}`
          : `Fruit ${fruit.index}: ${fruit.fruit} · ${fruit.disease} · ${fruit.confidence}% · ${fruit.severity} · Quality ${fruit.quality} · ${fruit.marketability} · ${fruit.ripeness}`,
      ),
    ]);
  }

  section("About this result", [result.about]);
  if (result.predictions?.length) {
    section(
      "Other possible answers",
      result.predictions.map((item) => `${item.plant} · ${item.disease} — ${item.confidence}%`),
    );
  }
  if (result.nextSteps?.length) section("What to do now", result.nextSteps);
  section("Symptoms", result.symptoms);
  section("Possible causes", result.causes);
  section("Treatment", result.treatment);
  if (result.organic?.length) section("Organic treatment", result.organic);
  if (result.chemical?.length) section("Chemical treatment", result.chemical);
  section("Prevention", result.prevention);
  section("Good farming habits", result.practices);
  section("Recovery tips", result.recovery);

  nextPageIfNeeded(40);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "This report is a guide only. Ask a local plant expert before using any chemical.",
    MARGIN,
    pageHeight - 30,
  );

  const safe = `${result.plant}-${result.disease}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`leaf-report-${safe}.pdf`);
}
