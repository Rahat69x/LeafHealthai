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

  // Smooth Spring-lerp 3D Physics State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const targetTilt = useRef({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const currentTilt = useRef({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const rafId = useRef<number | null>(null);

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

  useEffect(() => {
    if (reduced) return;
    const updatePhysics = () => {
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.1;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.1;
      currentTilt.current.glareX += (targetTilt.current.glareX - currentTilt.current.glareX) * 0.1;
      currentTilt.current.glareY += (targetTilt.current.glareY - currentTilt.current.glareY) * 0.1;

      setTilt({
        x: currentTilt.current.x,
        y: currentTilt.current.y,
        glareX: currentTilt.current.glareX,
        glareY: currentTilt.current.glareY,
      });

      rafId.current = requestAnimationFrame(updatePhysics);
    };

    rafId.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [reduced]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    targetTilt.current = {
      x: px * 14,
      y: -py * 14,
      glareX: (px + 0.5) * 100,
      glareY: (py + 0.5) * 100,
    };
  };

  const handleMouseLeave = () => {
    targetTilt.current = { x: 0, y: 0, glareX: 50, glareY: 50 };
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
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 dark:border-white/15 bg-white/75 dark:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-[0_4px_16px_-2px_rgba(47,122,63,0.15)] backdrop-blur-xl">
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

        {/* 3D Parallax Photo Card Container with Layered Optics */}
        <div ref={cardRef} className="relative mx-auto w-full max-w-[390px] py-4">
          {/* Layer 0: Dynamic Inverted Contact Ground Shadow */}
          <div
            className="pointer-events-none absolute -bottom-3 inset-x-10 h-8 rounded-full bg-emerald-950/20 dark:bg-black/50 blur-xl motion-safe:animate-[dynamic-ground-shadow_7.5s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]"
            style={{
              transform: `translate3d(${tilt.x * -0.7}px, ${tilt.y * -0.7}px, 0)`,
            }}
          />

          {/* Layer 1: Ambient Caustic Glow */}
          <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-lime-500/20 blur-2xl opacity-75 dark:opacity-45" />

          {/* Layer 2: 3D Frosted Glass Bezel */}
          <div
            style={{
              transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
            className="group relative aspect-square overflow-hidden rounded-3xl p-2.5 bg-gradient-to-b from-white/75 via-white/45 to-white/20 dark:from-white/18 dark:via-white/10 dark:to-white/5 border border-white/85 dark:border-white/20 backdrop-blur-2xl shadow-[0_26px_58px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)] motion-safe:animate-[float-liquid-3d_7.5s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]"
          >
            {/* Dynamic Interactive Specular Refraction Glare */}
            <div
              className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-60 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-95"
              style={{
                background: `radial-gradient(circle 260px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 40%, transparent 75%)`,
              }}
            />

            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-muted/60">
              <img
                loading="eager"
                fetchPriority="high"
                decoding="async"
                key={sample.src}
                src={sample.src}
                alt={`${sample.plant} leaf sample being analysed`}
                width={768}
                height={768}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Scan animation line */}
              {phase === "scan" && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-emerald-400/90 via-emerald-500/40 to-transparent motion-safe:animate-[scan-sweep_2.4s_ease-in-out_infinite]" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_calc(100%_-_1px),color-mix(in_oklab,var(--color-fern)_35%,transparent)_100%)] bg-[length:100%_18px] opacity-40" />
                </>
              )}

              {/* Hotspots */}
              {phase !== "scan" && !!sample.hotspots.length && (
                <div className="absolute inset-0">
                  {sample.hotspots.map((h, idx) => (
                    <span
                      key={idx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral/95 bg-coral/25 shadow-[0_0_20px_rgba(244,63,94,0.8),inset_0_0_10px_rgba(255,255,255,0.5)] backdrop-blur-[2px] motion-safe:animate-[pulse-soft_2s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]"
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
              <div className="absolute inset-x-3.5 top-3.5 z-30 flex items-center justify-between gap-2.5 rounded-2xl border border-white/80 dark:border-white/20 bg-white/85 dark:bg-slate-900/80 px-4 py-2.5 shadow-[0_14px_30px_-6px_rgba(0,0,0,0.22),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl motion-safe:animate-[float-drift_4.5s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="glass-icon-3d size-7.5 shrink-0 rounded-full">
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
                <span className="relative flex size-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </span>
              </div>

              {/* Result Floating Glass Card */}
              {phase === "result" && (
                <div className="absolute inset-x-3.5 bottom-3.5 z-30 rounded-2xl border border-white/85 dark:border-white/20 bg-white/90 dark:bg-slate-900/85 p-3.5 shadow-[0_18px_38px_-8px_rgba(0,0,0,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl animate-fade-in motion-safe:animate-[float-drift-gentle_5s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">
                      {sample.plant} · {sample.disease}
                    </p>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/18 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      {sample.confidence}% match
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted/80 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] motion-safe:animate-[grow-x_1s_cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${sample.confidence}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
