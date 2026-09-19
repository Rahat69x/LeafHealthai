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
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-8"
    >
      <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        Before &amp; after
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Watch a raw photo turn into a clear answer, stage by stage.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <figure className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/15 bg-muted shadow-md">
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
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-fern/80 via-fern/40 to-transparent motion-safe:animate-[scan-sweep_2s_linear_infinite]" />
          )}
          {stage >= 2 &&
            sample.hotspots.map((h, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/25 shadow-[0_0_12px_rgba(244,63,94,0.6)] motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]"
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.r * 2}%`,
                  height: `${h.r * 2}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          <figcaption className="absolute inset-x-3 bottom-3 rounded-full border border-white/70 dark:border-white/15 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 text-center text-xs font-bold text-foreground shadow-md backdrop-blur-xl">
            {STAGES[stage]}
          </figcaption>
        </figure>

        <ol className="grid content-center gap-3">
          {STAGES.map((label, i) => {
            const on = i === stage;
            return (
              <li
                key={label}
                className={`rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300 ${
                  on
                    ? "translate-x-1 border-emerald-500/50 bg-white/90 dark:bg-emerald-950/40 font-bold text-foreground shadow-[0_8px_24px_-4px_rgba(47,122,63,0.2),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl"
                    : "border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 text-muted-foreground backdrop-blur-md"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                      on ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span>{label}</span>
                </div>
                {i === 3 && stage === 3 && (
                  <span className="mt-2 block text-xs font-normal text-muted-foreground pl-8">
                    {sample.plant} · {sample.disease} · {sample.confidence}% confidence
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
