import { useEffect, useState } from "react";

import { SAMPLES } from "@/lib/landing-data";
import { usePrefersReducedMotion, useReveal } from "./use-reveal";

const STAGES = ["Original leaf", "AI analysis", "Highlighted area", "Final prediction"] as const;
const sample = SAMPLES[1]!;

export function BeforeAfter() {
  const { ref, shown } = useReveal<HTMLElement>();
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!shown) return;
    if (reduced) {
      setStage(STAGES.length - 1);
      return;
    }
    const id = setTimeout(() => setStage((s) => (s + 1) % STAGES.length), 2200);
    return () => clearTimeout(id);
  }, [stage, shown, reduced]);

  return (
    <section
      ref={ref}
      aria-label="Before and after analysis"
      className="rounded-3xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">Before &amp; after</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Watch a raw photo turn into a clear answer, stage by stage.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <figure className="relative overflow-hidden rounded-2xl border border-border bg-muted">
          <img
            src={sample.src}
            alt="Potato leaf before AI analysis"
            loading="lazy"
            decoding="async"
            width={768}
            height={768}
            className={`h-full w-full object-cover transition-all duration-700 ${
              stage >= 1 ? "saturate-150 contrast-125" : ""
            }`}
          />
          {stage === 1 && (
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-fern/70 to-transparent motion-safe:animate-[scan-sweep_2s_linear_infinite]" />
          )}
          {stage >= 2 &&
            sample.hotspots.map((h, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/25 motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]"
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.r * 2}%`,
                  height: `${h.r * 2}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          <figcaption className="absolute inset-x-3 bottom-3 rounded-full bg-forest-deep/70 px-3 py-1 text-center text-xs font-medium text-cream backdrop-blur">
            {STAGES[stage]}
          </figcaption>
        </figure>

        <ol className="grid content-center gap-3">
          {STAGES.map((label, i) => (
            <li
              key={label}
              className={`rounded-xl border px-4 py-3 text-sm transition-all duration-500 ${
                i === stage
                  ? "translate-x-1 border-fern bg-fern/10 font-semibold text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {i + 1}. {label}
              {i === 3 && stage === 3 && (
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {sample.plant} · {sample.disease} · {sample.confidence}% confidence
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
