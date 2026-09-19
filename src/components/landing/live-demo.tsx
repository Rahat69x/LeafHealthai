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
        {/* Photo Container with iOS Frosted Glass Framing & 3D Depth */}
        <div className="group relative aspect-square overflow-hidden rounded-3xl p-2 bg-gradient-to-b from-white/60 to-white/20 dark:from-white/15 dark:to-white/5 border border-white/80 dark:border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] motion-safe:animate-[float-drift_6s_ease-in-out_infinite]">
          <div className="relative h-full w-full overflow-hidden rounded-2xl bg-muted/60">
            <img
              key={sample.src}
              src={sample.src}
              alt={`${sample.plant} sample leaf`}
              loading="lazy"
              decoding="async"
              width={768}
              height={768}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Specular top-edge glass sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 via-white/5 to-transparent dark:from-white/15" />

            {/* Scan Beam */}
            {step === 1 && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-fern/80 via-fern/30 to-transparent motion-safe:animate-[scan-sweep_2s_linear_infinite]" />
            )}

            {/* 3D AR Augmented Glass Bounding Boxes */}
            {step >= 2 &&
              sample.leaves.map((leaf, idx) => (
                <span
                  key={`leaf-${idx}`}
                  className="absolute animate-fade-in rounded-xl border-2 backdrop-blur-[1.5px] transition-all duration-300"
                  style={{
                    ...boxStyle({
                      x: leaf.x / 100,
                      y: leaf.y / 100,
                      w: leaf.w / 100,
                      h: leaf.h / 100,
                    }),
                    borderColor: leaf.healthy ? "rgba(47, 122, 63, 0.9)" : "rgba(225, 29, 72, 0.9)",
                    backgroundColor: leaf.healthy
                      ? "rgba(47, 122, 63, 0.08)"
                      : "rgba(225, 29, 72, 0.08)",
                    boxShadow: leaf.healthy
                      ? "0 0 16px rgba(47, 122, 63, 0.25), inset 0 0 8px rgba(47, 122, 63, 0.15)"
                      : "0 0 16px rgba(225, 29, 72, 0.25), inset 0 0 8px rgba(225, 29, 72, 0.15)",
                    animationDelay: `${idx * 160}ms`,
                  }}
                >
                  {/* 3D Glass Bead Number Pill */}
                  <span
                    className="absolute -left-1 -top-1 flex size-6 items-center justify-center rounded-lg text-[11px] font-extrabold text-white shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.7)]"
                    style={{
                      background: leaf.healthy
                        ? "linear-gradient(135deg, #34d399 0%, #059669 100%)"
                        : "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    {idx + 1}
                  </span>
                </span>
              ))}

            {/* Disease Hotspots / Water Magnifier Spot */}
            {step >= 4 &&
              sample.hotspots.map((h, idx) => (
                <span
                  key={idx}
                  className="absolute rounded-full border-2 border-coral/90 bg-coral/25 shadow-[0_0_16px_rgba(244,63,94,0.7),inset_0_0_8px_rgba(255,255,255,0.4)] backdrop-blur-[2px] motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]"
                  style={spotStyle({ x: h.x / 100, y: h.y / 100, r: h.r / 100 })}
                />
              ))}
          </div>
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
                    ? "border-emerald-500/60 bg-gradient-to-r from-white/90 via-emerald-50/70 to-white/90 dark:from-slate-900/90 dark:via-emerald-950/50 dark:to-slate-900/90 text-foreground shadow-[0_12px_28px_-6px_rgba(47,122,63,0.28),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl -translate-y-0.5"
                    : passed
                      ? "border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 text-muted-foreground backdrop-blur-md shadow-sm"
                      : "border-white/30 dark:border-white/5 bg-white/30 dark:bg-white/5 text-muted-foreground/70 backdrop-blur-sm"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`glass-icon-3d size-8 shrink-0 rounded-xl transition-all duration-300 ${
                      active
                        ? "animate-[water-ripple_1.4s_ease-out] ring-2 ring-emerald-500/30"
                        : ""
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
            <li className="animate-fade-in rounded-2xl border border-white/80 dark:border-white/15 bg-white/90 dark:bg-slate-900/85 p-4 shadow-[0_16px_32px_-6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <p className="text-lg font-extrabold text-foreground">{sample.plant}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-xs ${
                    sample.healthy
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "border-coral/30 bg-coral/15 text-coral"
                  }`}
                >
                  {sample.disease}
                </span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] motion-safe:animate-[grow-x_1s_ease-out]"
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
