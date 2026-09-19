import { useEffect, useRef, useState } from "react";
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";

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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 12, y: -py * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const step =
    phase === "scan"
      ? "Scanning leaf…"
      : phase === "detect"
        ? "Leaf detected"
        : phase === "analyse"
          ? "Analysing disease…"
          : "Result ready";

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl px-5 py-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] sm:px-10 sm:py-14"
    >
      <FloatingBg />

      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="min-w-0">
          {/* iOS-Style Pill Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/60 dark:border-white/15 bg-white/70 dark:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-[0_4px_16px_-2px_rgba(47,122,63,0.15)] backdrop-blur-xl">
            <span className="glass-icon-3d size-5 shrink-0 rounded-full">
              <Sparkles className="size-3 text-fern-ink dark:text-fern" aria-hidden />
            </span>
            <span>AI leaf diagnosis in seconds</span>
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">{text}</p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button asChild size="lg" variant="default" className="shadow-lg">
              <a href="#scan">
                Scan a leaf <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>

        {/* 3D Parallax Photo Card Container */}
        <div
          ref={cardRef}
          style={{
            transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
            transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          className="relative mx-auto w-full max-w-[380px]"
        >
          {/* Ambient Glow underneath photo */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-lime-500/20 blur-xl opacity-75 dark:opacity-50 pointer-events-none" />

          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/70 dark:border-white/15 bg-muted shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]">
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

            {/* Scan animation line */}
            {phase === "scan" && (
              <>
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-fern/80 via-fern/40 to-transparent motion-safe:animate-[scan-sweep_2.4s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_calc(100%_-_1px),color-mix(in_oklab,var(--color-fern)_35%,transparent)_100%)] bg-[length:100%_18px] opacity-40" />
              </>
            )}

            {/* Hotspots */}
            {phase !== "scan" && !!sample.hotspots.length && (
              <div className="absolute inset-0">
                {sample.hotspots.map((h, idx) => (
                  <span
                    key={idx}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/25 shadow-[0_0_16px_rgba(244,63,94,0.6)] motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]"
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

            {/* Frosted Glass Status Card (Floating above the photo) */}
            <div className="absolute inset-x-3 top-3.5 flex items-center justify-between gap-2.5 rounded-2xl border border-white/70 dark:border-white/20 bg-white/75 dark:bg-slate-900/70 px-4 py-2.5 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-2xl motion-safe:animate-[float-drift_4s_ease-in-out_infinite]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="glass-icon-3d size-7 shrink-0 rounded-full">
                  {phase === "analyse" ? (
                    <Leaf
                      className="size-4 animate-spin text-fern-ink dark:text-fern"
                      aria-hidden
                    />
                  ) : phase === "result" ? (
                    <ShieldCheck
                      className="size-4 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                  ) : (
                    <Leaf className="size-4 text-fern-ink dark:text-fern" aria-hidden />
                  )}
                </span>
                <span className="text-xs font-bold tracking-tight text-foreground truncate">
                  {step}
                </span>
              </div>
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            </div>

            {/* Result Floating Glass Card */}
            {phase === "result" && (
              <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/80 dark:border-white/15 bg-white/85 dark:bg-slate-900/80 p-3.5 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl animate-fade-in motion-safe:animate-[float-drift-gentle_5s_ease-in-out_infinite]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">
                    {sample.plant} · {sample.disease}
                  </p>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {sample.confidence}% match
                  </span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted/80 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm motion-safe:animate-[grow-x_1s_ease-out]"
                    style={{ width: `${sample.confidence}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
