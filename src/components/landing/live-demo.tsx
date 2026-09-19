import { boxStyle, spotStyle } from "@/lib/annotation-geometry";
import { useEffect, useState } from "react";
import { Check, Eye, Leaf, Search, ShieldCheck, Sparkles } from "lucide-react";

import { SAMPLES } from "@/lib/landing-data";
import { usePrefersReducedMotion } from "./use-reveal";

const STEPS = [
  { key: "upload", label: "Upload leaf", icon: Leaf, ms: 1400 },
  { key: "scan", label: "Scanning…", icon: Search, ms: 2000 },
  { key: "leaves", label: "Finding every leaf…", icon: Eye, ms: 1600 },
  { key: "plant", label: "Detecting plant…", icon: Sparkles, ms: 1500 },
  { key: "disease", label: "Analysing disease…", icon: Leaf, ms: 1800 },
  { key: "result", label: "Diagnosis result", icon: ShieldCheck, ms: 3400 },
] as const;

export function LiveDemo() {
  const reduced = usePrefersReducedMotion();
  const [sampleIndex, setSampleIndex] = useState(0);
  const [step, setStep] = useState(reduced ? STEPS.length - 1 : 0);
  const sample = SAMPLES[sampleIndex % SAMPLES.length]!;

  useEffect(() => {
    if (reduced) return;
    const id = setTimeout(() => {
      setStep((s) => {
        if (s + 1 < STEPS.length) return s + 1;
        setSampleIndex((v) => v + 1);
        return 0;
      });
    }, STEPS[step]!.ms);
    return () => clearTimeout(id);
  }, [step, reduced]);

  const done = step === STEPS.length - 1;

  return (
    <section
      aria-label="Live AI demo"
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Live AI demo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sample leaves run through the same steps your photo does in real time.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Autonomous pipeline
        </span>
      </div>

      <div className="mt-7 grid gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-start">
        {/* Photo Container with layered glass effect */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/70 dark:border-white/15 bg-muted shadow-[0_16px_36px_-8px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.5)]">
          <img
            key={sample.src}
            src={sample.src}
            alt={`${sample.plant} sample leaf`}
            loading="lazy"
            decoding="async"
            width={768}
            height={768}
            className="h-full w-full object-cover"
          />
          {step === 1 && (
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-fern/80 via-fern/40 to-transparent motion-safe:animate-[scan-sweep_2s_linear_infinite]" />
          )}
          {step >= 2 &&
            sample.leaves.map((leaf, idx) => (
              <span
                key={`leaf-${idx}`}
                className="absolute animate-fade-in rounded-md border-2"
                style={{
                  ...boxStyle({
                    x: leaf.x / 100,
                    y: leaf.y / 100,
                    w: leaf.w / 100,
                    h: leaf.h / 100,
                  }),
                  borderColor: leaf.healthy ? "var(--fern)" : "var(--coral)",
                  animationDelay: `${idx * 160}ms`,
                }}
              >
                <span
                  className="absolute left-0 top-0 rounded-br-md rounded-tl-sm px-1.5 text-[11px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: leaf.healthy ? "var(--fern)" : "var(--coral)" }}
                >
                  {idx + 1}
                </span>
              </span>
            ))}
          {step >= 4 &&
            sample.hotspots.map((h, idx) => (
              <span
                key={idx}
                className="absolute rounded-full border-2 border-coral bg-coral/25 shadow-[0_0_12px_rgba(244,63,94,0.6)] motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]"
                style={spotStyle({ x: h.x / 100, y: h.y / 100, r: h.r / 100 })}
              />
            ))}
        </div>

        {/* Stacked Glass Step Carousel List */}
        <ol className="space-y-2.5">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = idx === step;
            const passed = idx < step;

            return (
              <li
                key={s.key}
                className={`relative flex items-center justify-between gap-3.5 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                  active
                    ? "border-emerald-500/50 bg-white/85 dark:bg-emerald-950/40 text-foreground shadow-[0_8px_24px_-4px_rgba(47,122,63,0.22),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl -translate-y-0.5"
                    : passed
                      ? "border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 text-muted-foreground backdrop-blur-md"
                      : "border-white/30 dark:border-white/5 bg-white/30 dark:bg-white/5 text-muted-foreground/70 backdrop-blur-sm"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`glass-icon-3d size-8 shrink-0 rounded-xl transition-all duration-300 ${
                      active ? "animate-[water-ripple_1.2s_ease-out]" : ""
                    }`}
                  >
                    {passed ? (
                      <Check
                        className="size-4 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                      />
                    ) : (
                      <Icon
                        className={`size-4 text-foreground/80 ${
                          active && s.key === "disease" ? "animate-spin" : ""
                        }`}
                        aria-hidden
                      />
                    )}
                  </span>
                  <span
                    className={`text-sm font-semibold truncate ${
                      active ? "text-foreground font-bold" : ""
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {active && (
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </li>
            );
          })}

          {done && (
            <li className="animate-fade-in rounded-2xl border border-white/80 dark:border-white/15 bg-white/90 dark:bg-slate-900/85 p-4 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <p className="text-lg font-extrabold text-foreground">{sample.plant}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    sample.healthy
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-coral/15 text-coral"
                  }`}
                >
                  {sample.disease}
                </span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 motion-safe:animate-[grow-x_1s_ease-out]"
                  style={{ width: `${sample.confidence}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {sample.leaves.length} leaves checked · {sample.confidence}% confidence ·{" "}
                {sample.advice}
              </p>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
