import { useCallback, useEffect, useMemo, useState } from "react";
import { Leaf } from "lucide-react";

import { AnnotationSurface } from "@/components/annotation-surface";
import { BoxEditor, type EditableBox } from "@/components/box-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { boxStyle, clampBox } from "@/lib/annotation-geometry";
import { leafColour } from "@/lib/leaf-annotate";
import { summariseLeaves, type LeafDiagnosis } from "@/lib/leaf-types";

type LeafFilter = "all" | "healthy" | "diseased" | "unknown";
type SeverityFilter = "all" | "Low" | "Medium" | "High";

const severityTone: Record<string, string> = {
  Low: "bg-fern/15 text-fern-ink border-fern/40",
  Medium: "bg-amber/20 text-amber-ink border-amber/50",
  High: "bg-destructive/10 text-destructive-ink border-destructive/40",
};

/** Zoomed crop of one leaf, made with a scaled background image. */
function LeafZoom({ image, leaf }: { image: string; leaf: LeafDiagnosis }) {
  const box = clampBox(leaf.box);
  const scale = 1 / Math.max(0.08, Math.max(box.w, box.h));
  return (
    <div
      className="aspect-video w-full overflow-hidden rounded-xl border bg-muted"
      style={{
        backgroundImage: `url(${image})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${scale * 100}% ${scale * 100}%`,
        backgroundPosition: `${(box.x + box.w / 2) * 100}% ${(box.y + box.h / 2) * 100}%`,
      }}
      role="img"
      aria-label={`Zoomed view of leaf ${leaf.index}`}
    />
  );
}

function Lines({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
        {items.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Props {
  image: string;
  leaves: LeafDiagnosis[];
  timeMs: number;
  notice?: string | undefined;
  onDownloadPdf?: () => void;
  onDownloadImage?: () => void;
  onDownloadJson?: () => void;
  onDownloadCsv?: () => void;
}

/** Every leaf found in one photo: boxes, numbers, filters and one card per leaf. */
export function MultiLeafPanel({
  image,
  leaves,
  timeMs,
  notice,
  onDownloadPdf,
  onDownloadImage,
  onDownloadJson,
  onDownloadCsv,
}: Props) {
  const [filter, setFilter] = useState<LeafFilter>("all");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [query, setQuery] = useState("");
  const [openLeaf, setOpenLeaf] = useState<LeafDiagnosis | null>(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const [editing, setEditing] = useState(false);
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const initialBoxes = useMemo<EditableBox[]>(
    () =>
      leaves.map((leaf) => ({
        id: `leaf-${leaf.index}`,
        box: clampBox(leaf.box),
        colour: leafColour(leaf),
        label: `${leaf.index}`,
      })),
    [leaves],
  );
  // Undo/redo stack of marker states; index 0 is the AI's own boxes.
  const [past, setPast] = useState<EditableBox[][]>([initialBoxes]);
  const [step, setStep] = useState(0);
  const marks = past[step] ?? initialBoxes;

  useEffect(() => {
    setPast([initialBoxes]);
    setStep(0);
    setSelectedId(null);
  }, [initialBoxes]);

  const pushMarks = useCallback(
    (next: EditableBox[]) => {
      setPast((history) => [...history.slice(0, step + 1), next].slice(-40));
      setStep((value) => Math.min(value + 1, 39));
    },
    [step],
  );

  const summary = useMemo(() => summariseLeaves(leaves), [leaves]);

  const shown = useMemo(() => {
    const text = query.trim().toLowerCase();
    return leaves.filter((leaf) => {
      if (filter === "healthy" && !(leaf.status === "ok" && leaf.healthy)) return false;
      if (filter === "diseased" && !(leaf.status === "ok" && !leaf.healthy)) return false;
      if (filter === "unknown" && leaf.status !== "unclear") return false;
      if (severity !== "all" && (leaf.status !== "ok" || leaf.severity !== severity)) return false;
      if (text && !`${leaf.disease} ${leaf.plant}`.toLowerCase().includes(text)) return false;
      return true;
    });
  }, [leaves, filter, severity, query]);

  if (!leaves.length) return null;

  const stats = [
    { label: "Total leaves", value: `${summary.total}` },
    { label: "Healthy", value: `${summary.healthy}` },
    { label: "Diseased", value: `${summary.diseased}` },
    { label: "Plant health", value: `${summary.healthScore}/100` },
    { label: "Average confidence", value: `${summary.avgConfidence}%` },
    { label: "Time taken", value: `${(timeMs / 1000).toFixed(1)}s` },
  ];

  return (
    <section className="rounded-2xl border bg-muted/40 p-4" aria-labelledby="multi-leaf-heading">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <p id="multi-leaf-heading" className="text-sm font-semibold text-foreground">
            {summary.total === 1
              ? "Leaf found in your photo"
              : `All ${summary.total} leaves in your photo`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Every leaf was checked on its own. Green means healthy, red means it needs care, grey
            means we could not read it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onDownloadImage && (
            <Button variant="outline" size="sm" onClick={onDownloadImage}>
              <Leaf aria-hidden="true" /> Marked photo
            </Button>
          )}
          {onDownloadJson && (
            <Button variant="outline" size="sm" onClick={onDownloadJson}>
              <Leaf aria-hidden="true" /> JSON
            </Button>
          )}
          {onDownloadCsv && (
            <Button variant="outline" size="sm" onClick={onDownloadCsv}>
              <Leaf aria-hidden="true" /> CSV
            </Button>
          )}
          {onDownloadPdf && (
            <Button variant="outline" size="sm" onClick={onDownloadPdf}>
              <Leaf aria-hidden="true" /> PDF
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <p className="mt-3 rounded-xl border border-amber/50 bg-amber/10 p-3 text-sm text-foreground">
          {notice}
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <AnnotationSurface
            src={image}
            alt={`Your photo with ${summary.total} leaves marked`}
            className="rounded-xl border bg-background"
            imgClassName="w-full"
            overlayRef={setSurface}
          >
            {editing ? (
              <BoxEditor
                boxes={marks}
                onChange={pushMarks}
                selectedId={selectedId}
                onSelect={setSelectedId}
                surface={surface}
              />
            ) : (
              showBoxes &&
              marks.map((mark, position) => {
                const leaf = leaves[position];
                return (
                  <button
                    key={mark.id}
                    type="button"
                    onClick={() => leaf && setOpenLeaf(leaf)}
                    aria-label={`Open the result for leaf ${mark.label}`}
                    className="pointer-events-auto absolute rounded-md border-2 transition hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ ...boxStyle(mark.box), borderColor: mark.colour }}
                  >
                    <span
                      className="absolute top-0 left-0 rounded-br-md rounded-tl-sm px-1.5 text-xs font-bold text-white"
                      style={{ backgroundColor: mark.colour }}
                    >
                      {mark.label}
                    </span>
                  </button>
                );
              })
            )}
          </AnnotationSurface>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {editing
                ? "Drag a mark to move it, use the corners to resize, or drag on the photo to add one."
                : "Tap any leaf to open its full result."}
            </p>
            <div className="flex flex-wrap gap-1">
              {editing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep((value) => Math.max(0, value - 1))}
                    disabled={step === 0}
                    aria-label="Undo the last mark change"
                  >
                    <Leaf aria-hidden="true" /> Undo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep((value) => Math.min(past.length - 1, value + 1))}
                    disabled={step >= past.length - 1}
                    aria-label="Redo the last mark change"
                  >
                    <Leaf aria-hidden="true" /> Redo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!selectedId) return;
                      pushMarks(marks.filter((mark) => mark.id !== selectedId));
                      setSelectedId(null);
                    }}
                    disabled={!selectedId}
                    aria-label="Delete the selected mark"
                  >
                    <Leaf aria-hidden="true" /> Delete
                  </Button>
                </>
              )}
              <Button
                variant={editing ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setEditing((on) => !on);
                  setSelectedId(null);
                  setShowBoxes(true);
                }}
              >
                <Leaf aria-hidden="true" /> {editing ? "Done editing" : "Edit marks"}
              </Button>
              {!editing && (
                <Button variant="ghost" size="sm" onClick={() => setShowBoxes((on) => !on)}>
                  {showBoxes ? "Show original photo" : "Show marked photo"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border bg-background p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="relative">
          <Leaf
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by disease"
            aria-label="Search leaves by disease"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "healthy", "diseased", "unknown"] as LeafFilter[]).map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={filter === option ? "default" : "outline"}
              onClick={() => setFilter(option)}
            >
              {option === "all"
                ? "All"
                : option === "healthy"
                  ? "Healthy"
                  : option === "diseased"
                    ? "Needs care"
                    : "Not clear"}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "Low", "Medium", "High"] as SeverityFilter[]).map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={severity === option ? "default" : "outline"}
              onClick={() => setSeverity(option)}
            >
              {option === "all" ? "Any severity" : option}
            </Button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-4 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
          No leaf matches this filter.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {shown.map((leaf) => (
            <li key={leaf.index}>
              <button
                type="button"
                onClick={() => setOpenLeaf(leaf)}
                className="w-full rounded-xl border bg-background p-4 text-left transition hover:border-primary/50 hover:shadow-sm"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: leafColour(leaf) }}
                        aria-hidden="true"
                      />
                      Leaf {leaf.index}
                    </p>
                    <p className="mt-0.5 truncate text-base font-semibold text-foreground">
                      {leaf.status === "unclear" ? "Could not be read" : leaf.disease}
                    </p>
                    <p className="text-xs text-muted-foreground">{leaf.plant}</p>
                  </div>
                  {leaf.status === "ok" && (
                    <Badge
                      variant="outline"
                      className={`shrink-0 rounded-full ${leaf.healthy ? "border-fern/40 bg-fern/15 text-fern-ink" : (severityTone[leaf.severity] ?? "")}`}
                    >
                      {leaf.healthy ? "Healthy" : leaf.severity}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{leaf.note}</p>
                {leaf.status === "ok" && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sure of this leaf</span>
                      <span className="font-semibold text-foreground">{leaf.confidence}%</span>
                    </div>
                    <Progress value={leaf.confidence} className="mt-1 h-1.5" />
                  </div>
                )}
                <span className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                  <Leaf className="size-3.5" aria-hidden="true" /> Open this leaf
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(openLeaf)} onOpenChange={(open) => !open && setOpenLeaf(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {openLeaf && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Leaf {openLeaf.index} ·{" "}
                  {openLeaf.status === "unclear" ? "Could not be read" : openLeaf.disease}
                </DialogTitle>
                <DialogDescription>
                  {openLeaf.plant}
                  {openLeaf.status === "ok"
                    ? ` · ${openLeaf.confidence}% sure · ${openLeaf.severity} severity`
                    : ""}
                </DialogDescription>
              </DialogHeader>
              <LeafZoom image={image} leaf={openLeaf} />
              <p className="text-sm text-muted-foreground">{openLeaf.note}</p>
              <Lines title="Seen on this leaf" items={openLeaf.visibleSymptoms} />
              <Lines title="Treatment" items={openLeaf.treatment} />
              <Lines title="Natural treatment" items={openLeaf.organic} />
              <Lines title="Medicine spray" items={openLeaf.chemical} />
              <Lines title="What to do now" items={openLeaf.nextSteps} />
              {openLeaf.nutrients.length > 0 && (
                <Lines
                  title="Nutrient shortage"
                  items={openLeaf.nutrients.map(
                    (item) =>
                      `${item.name} (${item.confidence}%): ${item.visualSymptoms[0] ?? item.severity + " shortage"}`,
                  )}
                />
              )}
              {openLeaf.pests.length > 0 && (
                <Lines
                  title="Pests"
                  items={openLeaf.pests.map(
                    (item) =>
                      `${item.name} (${item.confidence}%): ${item.evidence[0] ?? item.severity + " damage"}`,
                  )}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
