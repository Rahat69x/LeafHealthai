import { useMemo, useState } from "react";
import { Leaf } from "lucide-react";

import { AnnotationSurface } from "@/components/annotation-surface";
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
import { boxStyle, clampBox, spotStyle } from "@/lib/annotation-geometry";
import { fruitColour, summariseFruits, type FruitDiagnosis } from "@/lib/fruit-types";

type FruitFilter = "all" | "healthy" | "diseased" | "unknown";

const severityTone: Record<string, string> = {
  Low: "bg-fern/15 text-fern-ink border-fern/40",
  Medium: "bg-amber/20 text-amber-ink border-amber/50",
  High: "bg-destructive/10 text-destructive-ink border-destructive/40",
};

const marketTone: Record<string, string> = {
  "Market Ready": "bg-fern/15 text-fern-ink border-fern/40",
  "Needs Treatment": "bg-amber/20 text-amber-ink border-amber/50",
  "Not Marketable": "bg-destructive/10 text-destructive-ink border-destructive/40",
};

function FruitZoom({ image, fruit }: { image: string; fruit: FruitDiagnosis }) {
  const box = clampBox(fruit.box);
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
      aria-label={`Zoomed view of fruit ${fruit.index}`}
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
  fruits: FruitDiagnosis[];
}

/** Every fruit found in one photo: boxes, numbers, filters and one card per fruit. */
export function FruitPanel({ image, fruits }: Props) {
  const [filter, setFilter] = useState<FruitFilter>("all");
  const [query, setQuery] = useState("");
  const [showBoxes, setShowBoxes] = useState(true);
  const [showMarks, setShowMarks] = useState(true);
  const [showShapes, setShowShapes] = useState(true);
  const [open, setOpen] = useState<FruitDiagnosis | null>(null);

  const summary = useMemo(() => summariseFruits(fruits), [fruits]);
  const shown = useMemo(
    () =>
      fruits.filter((fruit) => {
        if (filter === "healthy" && !(fruit.status === "ok" && fruit.healthy)) return false;
        if (filter === "diseased" && !(fruit.status === "ok" && !fruit.healthy)) return false;
        if (filter === "unknown" && fruit.status === "ok") return false;
        const text = `${fruit.fruit} ${fruit.disease} ${fruit.defects.join(" ")}`.toLowerCase();
        return !query.trim() || text.includes(query.trim().toLowerCase());
      }),
    [fruits, filter, query],
  );

  if (!fruits.length) return null;

  const filters: { id: FruitFilter; label: string }[] = [
    { id: "all", label: `All (${summary.total})` },
    { id: "healthy", label: `Healthy (${summary.healthy})` },
    { id: "diseased", label: `Needs care (${summary.diseased})` },
    { id: "unknown", label: `Not clear (${summary.skipped})` },
  ];

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Fruit check</h3>
          <p className="text-sm text-muted-foreground">
            {summary.total} fruit{summary.total === 1 ? "" : "s"} found · each one checked on its
            own.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={showBoxes ? "default" : "outline"}
            onClick={() => setShowBoxes((v) => !v)}
          >
            Boxes
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showMarks ? "default" : "outline"}
            onClick={() => setShowMarks((v) => !v)}
          >
            Marks
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showShapes ? "default" : "outline"}
            onClick={() => setShowShapes((v) => !v)}
          >
            Shapes
          </Button>
        </div>
      </div>

      <AnnotationSurface
        src={image}
        alt="Fruits found in your photo"
        className="mt-4 aspect-video w-full rounded-2xl border bg-muted"
      >
        {showBoxes &&
          fruits.map((fruit) => {
            const colour = fruitColour(fruit);
            return (
              <button
                key={`fruit-box-${fruit.index}`}
                type="button"
                onClick={() => setOpen(fruit)}
                className="absolute rounded-md border-2 text-left"
                style={{
                  ...boxStyle(fruit.box),
                  borderColor: colour,
                  boxShadow: `0 0 0 1px rgba(0,0,0,.25)`,
                }}
                aria-label={`Fruit ${fruit.index}: ${fruit.fruit}, ${fruit.disease}`}
              >
                <span
                  className="absolute -top-0.5 left-0 -translate-y-full rounded px-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: colour }}
                >
                  {fruit.index}
                </span>
              </button>
            );
          })}
        {showShapes && fruits.some((fruit) => (fruit.mask?.length ?? 0) >= 3) && (
          <svg
            className="pointer-events-none absolute inset-0 size-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {fruits
              .filter((fruit) => (fruit.mask?.length ?? 0) >= 3)
              .map((fruit) => (
                <polygon
                  key={`fruit-mask-${fruit.index}`}
                  points={(fruit.mask ?? [])
                    .map(
                      (point) =>
                        `${Math.min(100, Math.max(0, point.x * 100))},${Math.min(100, Math.max(0, point.y * 100))}`,
                    )
                    .join(" ")}
                  fill={fruitColour(fruit)}
                  fillOpacity={0.16}
                  stroke={fruitColour(fruit)}
                  strokeOpacity={0.9}
                  strokeWidth={0.4}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
          </svg>
        )}
        {showMarks &&
          fruits.flatMap((fruit) =>
            fruit.hotspots.map((spot, i) => (
              <span
                key={`fruit-${fruit.index}-spot-${i}`}
                className="pointer-events-none absolute rounded-full border-2 border-destructive/80 bg-destructive/25"
                style={spotStyle(spot)}
                aria-hidden="true"
              />
            )),
          )}
      </AnnotationSurface>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Total fruits", String(summary.total)],
          ["Healthy", String(summary.healthy)],
          ["Diseased", String(summary.diseased)],
          ["Avg confidence", `${summary.avgConfidence}%`],
          ["Avg severity", summary.diseased ? `${summary.avgSeverity}/3` : "—"],
          ["Health score", `${summary.healthScore}/100`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-background p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-lg font-bold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <Progress value={summary.healthScore} className="h-2" />
        <p className="mt-1 text-xs text-muted-foreground">
          Overall fruit health score · {summary.marketReady} of {summary.total} look market ready.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
        <div className="relative ml-auto min-w-40 flex-1 sm:max-w-56">
          <Leaf
            className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search fruit or problem"
            className="pl-8"
            aria-label="Search fruits"
          />
        </div>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {shown.map((fruit) => (
          <li key={`fruit-card-${fruit.index}`}>
            <button
              type="button"
              onClick={() => setOpen(fruit)}
              className="w-full rounded-2xl border bg-background p-4 text-left transition hover:border-primary/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <span
                    className="grid size-6 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: fruitColour(fruit) }}
                  >
                    {fruit.index}
                  </span>
                  {fruit.fruit}
                </span>
                {fruit.status === "ok" ? (
                  <Badge variant="outline" className={severityTone[fruit.severity]}>
                    {fruit.healthy ? "Healthy" : `${fruit.severity} severity`}
                  </Badge>
                ) : (
                  <Badge variant="outline">Not clear</Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {fruit.status === "ok" ? fruit.disease : fruit.note}
              </p>
              {fruit.status === "ok" && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{fruit.confidence}% sure</Badge>
                  <Badge variant="outline">Quality: {fruit.quality}</Badge>
                  <Badge variant="outline" className={marketTone[fruit.marketability]}>
                    {fruit.marketability}
                  </Badge>
                  {fruit.ripeness !== "Unknown" && (
                    <Badge variant="outline">{fruit.ripeness}</Badge>
                  )}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Fruit {open.index} · {open.fruit}
                </DialogTitle>
                <DialogDescription>
                  {open.status === "ok" ? open.disease : open.note}
                </DialogDescription>
              </DialogHeader>
              <FruitZoom image={image} fruit={open} />
              {open.status === "ok" && (
                <>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{open.confidence}% sure</Badge>
                    <Badge variant="outline" className={severityTone[open.severity]}>
                      {open.healthy ? "No visible disease" : `${open.severity} severity`}
                    </Badge>
                    <Badge variant="outline">Quality: {open.quality}</Badge>
                    <Badge variant="outline" className={marketTone[open.marketability]}>
                      {open.marketability}
                    </Badge>
                    <Badge variant="outline">Ripeness: {open.ripeness}</Badge>
                    <Badge variant="outline">Health {open.healthScore}/100</Badge>
                  </div>
                  <Lines title="Damage seen" items={open.defects} />
                  <Lines title="Visible symptoms" items={open.visibleSymptoms} />
                  <Lines title="Likely causes" items={open.causes} />
                  <Lines title="Treatment" items={open.treatment} />
                  <Lines title="Organic options" items={open.organic} />
                  <Lines title="Chemical options" items={open.chemical} />
                  <Lines title="Prevention" items={open.prevention} />
                  <Lines title="What to do now" items={open.nextSteps} />
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
