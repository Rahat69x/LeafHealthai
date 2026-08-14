import { boxStyle, spotStyle } from "@/lib/annotation-geometry";
import { useEffect, useState } from "react";
import { Leaf, ShieldCheck } from "lucide-react";

import { SAMPLES } from "@/lib/landing-data";
import { usePrefersReducedMotion } from "./use-reveal";

const STEPS = [
  { key: "upload", label: "Upload leaf", icon: Leaf, ms: 1200 },
  { key: "scan", label: "Scanning…", icon: Leaf, ms: 2000 },
  { key: "leaves", label: "Finding every leaf…", icon: Leaf, ms: 1600 },
  { key: "plant", label: "Detecting plant…", icon: Leaf, ms: 1400 },
  { key: "disease", label: "Analysing disease…", icon: Leaf, ms: 1800 },
  { key: "result", label: "Result", icon: ShieldCheck, ms: 3200 },
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
      className="rounded-3xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">Live AI demo</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sample leaves run through the same steps your photo does. No clicks needed.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
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
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-fern/70 to-transparent motion-safe:animate-[scan-sweep_2s_linear_infinite]" />
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
                  className="absolute left-0 top-0 rounded-br-md rounded-tl-sm px-1.5 text-[11px] font-bold text-white"
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
                className="absolute rounded-full border-2 border-coral bg-coral/20 motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]"
                style={spotStyle({ x: h.x / 100, y: h.y / 100, r: h.r / 100 })}
              />
            ))}
        </div>

        <ol className="space-y-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = idx === step;
            const passed = idx < step;
            return (
              <li
                key={s.key}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  active
                    ? "border-fern bg-fern/10 text-foreground"
                    : passed
                      ? "border-border bg-muted/50 text-muted-foreground"
                      : "border-border/60 text-muted-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active && s.key === "disease" ? "animate-spin" : ""}`}
                  aria-hidden
                />
                <span className="text-sm font-medium">{s.label}</span>
              </li>
            );
          })}
          {done && (
            <li className="animate-fade-in rounded-xl border border-border bg-background p-4">
              <p className="text-lg font-extrabold text-foreground">{sample.plant}</p>
              <p
                className={`text-sm font-semibold ${sample.healthy ? "text-fern-ink" : "text-coral"}`}
              >
                {sample.disease}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-fern motion-safe:animate-[grow-x_1s_ease-out]"
                  style={{ width: `${sample.confidence}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
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
