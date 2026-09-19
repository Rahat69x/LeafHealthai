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

      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div className="min-w-0">
          {/* PlantAI Smart IOT Status Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="iot-telemetry-badge shadow-xs">
              <span className="iot-radar-ping size-2 mr-1">
                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              </span>
              PlantAI Smart IoT · Live Telemetry
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground/80">
              <span className="text-emerald-500 font-bold">NODE_09:</span> ONLINE
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-5xl font-['Outfit']">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            {text}
          </p>

          {/* PlantAI Quick Telemetry Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4 py-3 px-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md max-w-xl">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-foreground">
                Sensors:{" "}
                <span className="text-emerald-600 dark:text-emerald-400">4,820 Active</span>
              </span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                Accuracy: <span className="font-semibold text-foreground">99.4%</span>
              </span>
            </div>
            <span className="text-border hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                Latency:{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  &lt;1.2s
                </span>
              </span>
            </div>
          </div>

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

        {/* 3D Parallax Photo Card Container with Layered PlantAI IoT Optics */}
        <div ref={cardRef} className="relative mx-auto w-full max-w-[420px] py-4">
          {/* Layer 0: Dynamic Inverted Contact Ground Shadow */}
          <div
            className="pointer-events-none absolute -bottom-3 inset-x-12 h-8 rounded-full bg-emerald-950/25 dark:bg-black/60 blur-xl motion-safe:animate-[dynamic-ground-shadow_7.5s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]"
            style={{
              transform: `translate3d(${tilt.x * -0.7}px, ${tilt.y * -0.7}px, 0)`,
            }}
          />

          {/* Layer 1: Ambient Caustic Glow */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-emerald-500/25 via-teal-500/20 to-lime-500/20 blur-2xl opacity-80 dark:opacity-50" />

          {/* Floating IoT Satellite Widget: Soil Moisture (Top-Left Parallax) */}
          <div
            className="hidden sm:flex absolute -left-6 top-8 z-40 items-center gap-2.5 rounded-2xl border border-white/85 dark:border-white/20 bg-white/90 dark:bg-slate-900/90 py-2 px-3 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-transform duration-300"
            style={{
              transform: `translate3d(${tilt.x * 0.4}px, ${tilt.y * 0.4}px, 20px)`,
            }}
          >
            <div className="size-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-bold">💧</span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-muted-foreground">Soil Moisture</p>
              <p className="text-xs font-bold font-mono text-foreground">
                68.4% <span className="text-[10px] text-emerald-500 font-normal">Optimal</span>
              </p>
            </div>
          </div>

          {/* Floating IoT Satellite Widget: Chlorophyll Density (Bottom-Right Parallax) */}
          <div
            className="hidden sm:flex absolute -right-6 bottom-10 z-40 items-center gap-2.5 rounded-2xl border border-white/85 dark:border-white/20 bg-white/90 dark:bg-slate-900/90 py-2 px-3 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-transform duration-300"
            style={{
              transform: `translate3d(${tilt.x * -0.5}px, ${tilt.y * -0.5}px, 20px)`,
            }}
          >
            <div className="size-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-bold">🌿</span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-muted-foreground">
                Chlorophyll Index
              </p>
              <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                94.2% <span className="text-[10px] text-muted-foreground font-normal">NDVI</span>
              </p>
            </div>
          </div>

          {/* Layer 2: 3D Frosted Glass Bezel */}
          <div
            style={{
              transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
            className="group relative aspect-square overflow-hidden rounded-3xl p-2.5 bg-gradient-to-b from-white/80 via-white/50 to-white/25 dark:from-white/20 dark:via-white/10 dark:to-white/5 border border-white/90 dark:border-white/20 backdrop-blur-2xl shadow-[0_28px_64px_-12px_rgba(0,0,0,0.22)] dark:shadow-[0_32px_76px_-15px_rgba(0,0,0,0.75)] motion-safe:animate-[float-liquid-3d_7.5s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]"
          >
            {/* Dynamic Interactive Specular Refraction Glare */}
            <div
              className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-60 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-95"
              style={{
                background: `radial-gradient(circle 260px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 40%, transparent 75%)`,
              }}
            />

            {/* Scientific HUD Viewfinder Crosshairs in Corners */}
            <div className="pointer-events-none absolute inset-4 z-30 flex flex-col justify-between text-[9px] font-mono text-emerald-600/70 dark:text-emerald-400/70 select-none">
              <div className="flex justify-between">
                <span>[ +01 // PLANT_AI ]</span>
                <span>[ LAT: 23.81°N ]</span>
              </div>
              <div className="flex justify-between">
                <span>[ NIR_BAND: 780nm ]</span>
                <span>[ IOT_TELEMETRY: OK ]</span>
              </div>
            </div>

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
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-emerald-400/95 via-emerald-500/40 to-transparent motion-safe:animate-[scan-sweep_2.4s_ease-in-out_infinite]" />
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
                  <span className="text-xs font-bold tracking-tight text-foreground truncate font-mono">
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
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/18 px-2.5 py-0.5 text-[11px] font-bold font-mono text-emerald-700 dark:text-emerald-300">
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
