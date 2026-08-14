import { useEffect, useState } from "react";
import { ArrowRight, Leaf, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SAMPLES } from "@/lib/landing-data";
import { FloatingBg } from "./floating-bg";
import { usePrefersReducedMotion } from "./use-reveal";

const PHASES = ["scan", "detect", "analyse", "result"] as const;
const DURATIONS = { scan: 2600, detect: 1200, analyse: 1600, result: 3200 } as const;

export function HeroScan({ title, text }: { title: string; text: string }) {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<(typeof PHASES)[number]>("scan");
  const sample = SAMPLES[i % SAMPLES.length]!;

  useEffect(() => {
    if (reduced) {
      setPhase("result");
      return;
    }
    const next = PHASES[(PHASES.indexOf(phase) + 1) % PHASES.length]!;
    const id = setTimeout(() => {
      setPhase(next);
      if (next === "scan") setI((v) => v + 1);
    }, DURATIONS[phase]);
    return () => clearTimeout(id);
  }, [phase, reduced]);

  const step =
    phase === "scan"
      ? "Scanning leaf…"
      : phase === "detect"
        ? "Leaf detected"
        : phase === "analyse"
          ? "Analysing disease…"
          : "Result ready";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card/70 px-5 py-10 sm:px-10 sm:py-14">
      <FloatingBg />
      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-fern/40 bg-fern/10 px-3 py-1 text-xs font-semibold text-foreground">
            <Leaf className="h-3.5 w-3.5" aria-hidden /> AI leaf diagnosis in seconds
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">{text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#scan">
                Scan a leaf <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[380px]">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
            <img
              loading="eager"
              fetchPriority="high"
              decoding="async"
              key={sample.src}
              src={sample.src}
              alt={`${sample.plant} leaf sample being analysed`}
              width={768}
              height={768}
              className="h-full w-full object-cover"
            />
            {phase === "scan" && (
              <>
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-fern/70 to-transparent motion-safe:animate-[scan-sweep_2.4s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_calc(100%_-_1px),color-mix(in_oklab,var(--color-fern)_35%,transparent)_100%)] bg-[length:100%_18px] opacity-40" />
              </>
            )}
            {phase !== "scan" && !!sample.hotspots.length && (
              <div className="absolute inset-0">
                {sample.hotspots.map((h, idx) => (
                  <span
                    key={idx}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/20 motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]"
                    style={{
                      left: `${h.x}%`,
                      top: `${h.y}%`,
                      width: `${h.r * 2}%`,
                      height: `${h.r * 2}%`,
                      animationDelay: `${idx * 0.25}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <div className="absolute inset-x-3 top-3 flex items-center gap-2 rounded-full bg-forest-deep/70 px-3 py-1.5 text-xs font-medium text-cream backdrop-blur">
              {phase === "analyse" ? (
                <Leaf className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : phase === "result" ? (
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Leaf className="h-3.5 w-3.5" aria-hidden />
              )}
              <span>{step}</span>
            </div>

            {phase === "result" && (
              <div className="absolute inset-x-3 bottom-3 rounded-xl border border-border bg-card/95 p-3 animate-fade-in">
                <p className="text-sm font-bold text-foreground">
                  {sample.plant} · {sample.disease}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-fern motion-safe:animate-[grow-x_1s_ease-out]"
                    style={{ width: `${sample.confidence}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sample.confidence}% confidence
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
