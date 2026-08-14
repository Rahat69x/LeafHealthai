import { useState } from "react";
import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import { AnnotationSurface } from "@/components/annotation-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { spotStyle } from "@/lib/annotation-geometry";
import type { AnalysisResult, Hotspot } from "@/lib/demo-analysis";

function tone(intensity: number) {
  if (intensity >= 0.75) return "var(--destructive)";
  if (intensity >= 0.5) return "var(--amber)";
  return "var(--fern)";
}

function Marks({
  spots,
  active,
  onHover,
}: {
  spots: Hotspot[];
  active: number | null;
  onHover: (index: number | null) => void;
}) {
  return (
    <>
      {spots.map((spot, index) => {
        const intensity = spot.intensity ?? 0.7;
        const colour = tone(intensity);
        return (
          <button
            type="button"
            key={`${spot.x}-${spot.y}-${index}`}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(index)}
            onBlur={() => onHover(null)}
            aria-label={`${spot.label ?? "Affected area"} — mark ${index + 1}`}
            className={`pointer-events-auto absolute rounded-full transition-transform ${active === index ? "scale-110" : ""}`}
            style={{
              ...spotStyle(spot),
              background: `radial-gradient(circle, color-mix(in oklab, ${colour} ${Math.round(
                40 + intensity * 45,
              )}%, transparent) 0%, transparent 72%)`,
              outline:
                active === index
                  ? `2px solid color-mix(in oklab, ${colour} 70%, transparent)`
                  : "none",
              outlineOffset: "-2px",
            }}
          />
        );
      })}
    </>
  );
}

/**
 * "Why this answer" panel. Shows the marks the AI used on the real photo,
 * what it saw, and how sure it is. If the AI could not place any marks we say
 * so instead of drawing something made up.
 */
export function ExplainPanel({ result }: { result: AnalysisResult }) {
  const [showMarks, setShowMarks] = useState(true);
  const [compare, setCompare] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  const spots = result.hotspots ?? [];
  const patterns = result.visualPatterns ?? [];
  const seen = result.visibleSymptoms ?? [];
  const reasoning = result.reasoning ?? [];
  const hasExplanation =
    spots.length > 0 || patterns.length > 0 || seen.length > 0 || reasoning.length > 0;

  return (
    <section className="rounded-2xl border bg-muted/40 p-4" aria-labelledby="explain-heading">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3
            id="explain-heading"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Leaf className="size-4 text-primary" aria-hidden="true" /> Why the AI says this
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.disease} · {result.confidence}% sure
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 rounded-full">
          {spots.length > 0
            ? `${spots.length} marked area${spots.length > 1 ? "s" : ""}`
            : "No marks"}
        </Badge>
      </div>

      <div className={`mt-4 grid gap-3 ${compare ? "sm:grid-cols-2" : ""}`}>
        <figure className="relative">
          <AnnotationSurface
            src={result.image}
            alt="The leaf you checked, with the affected areas marked"
            className="rounded-2xl border bg-muted"
            imgClassName="h-64 w-full"
            loading="lazy"
          >
            {showMarks && <Marks spots={spots} active={active} onHover={setActive} />}
          </AnnotationSurface>
          <figcaption className="absolute bottom-2 left-2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground">
            {spots.length > 0
              ? active !== null
                ? (spots[active]?.label ?? "Affected area")
                : "Touch a mark to see what it is"
              : "No marks could be placed"}
          </figcaption>
        </figure>

        {compare && (
          <div className="rounded-2xl border bg-background/60 p-4">
            <p className="text-sm font-semibold text-foreground">
              A healthy {result.plant.toLowerCase()} leaf
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {result.healthyLook.map((line) => (
                <li key={line} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-fern"
                    aria-hidden="true"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-semibold text-foreground">Your leaf</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {result.symptoms.map((line) => (
                <li key={line} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-amber"
                    aria-hidden="true"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => setShowMarks((value) => !value)}
          disabled={spots.length === 0}
        >
          {showMarks ? <ShieldCheck aria-hidden="true" /> : <Leaf aria-hidden="true" />}
          {showMarks ? "Hide marks" : "Show marks"}
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => setCompare((value) => !value)}
        >
          <Droplet aria-hidden="true" />{" "}
          {compare ? "Hide healthy leaf" : "Compare with healthy leaf"}
        </Button>
      </div>

      {spots.length > 0 && (
        <ul className="mt-4 space-y-2">
          {spots.map((spot, index) => (
            <li
              key={`legend-${index}`}
              className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-1.5 ${
                active === index ? "bg-background" : ""
              }`}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >
              <span
                className="size-3 rounded-full"
                style={{
                  background: `color-mix(in oklab, ${tone(spot.intensity ?? 0.7)} 80%, transparent)`,
                }}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate text-sm text-foreground">
                {spot.label ?? "Affected area"}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {Math.round((spot.intensity ?? 0.7) * 100)}% weight
              </span>
            </li>
          ))}
        </ul>
      )}

      {seen.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Seen in your photo
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {seen.map((line) => (
              <li key={line} className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {patterns.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Patterns the AI used
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {patterns.map((pattern) => (
              <Badge key={pattern} variant="secondary" className="rounded-full">
                {pattern}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {reasoning.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            In short
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {reasoning.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-moss" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          How sure the AI is
        </p>
        <Progress value={result.confidence} className="mt-2 h-2" />
        <p className="mt-1 text-xs text-muted-foreground">
          {result.confidence}% sure. A lower number means you should check the leaf again in a few
          days.
        </p>
      </div>

      {!hasExplanation && (
        <p className="mt-4 flex gap-2 rounded-xl border bg-background/60 p-3 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />A detailed visual
          explanation is not available for this photo. The result above is still based on the leaf
          you uploaded, but the AI could not point to exact areas.
        </p>
      )}
    </section>
  );
}
