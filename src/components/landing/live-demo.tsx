import { boxStyle, spotStyle } from "@/lib/annotation-geometry";
import { useEffect, useRef, useState } from "react";
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

  // Smooth Spring-lerp 3D Physics State
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const targetTilt = useRef({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const currentTilt = useRef({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const updatePhysics = () => {
      // Lerp with 0.1 factor for inertia and fluid damping
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
    if (reduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="iot-telemetry-badge">
              <span className="iot-radar-ping size-2 mr-1">
                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              </span>
              SMART IOT PIPELINE
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              AUTO-STREAM V2.4
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl font-['Outfit']">
            Live AI demo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sample leaves run through the same steps your photo does in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold font-mono text-emerald-700 dark:text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Autonomous Pipeline · Active
          </span>
        </div>
      </div>

      <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] items-start">
        {/* 3D Multi-Layered Photo Rig Container */}
        <div ref={containerRef} className="relative mx-auto w-full max-w-[360px] py-4">
          {/* Layer 0: Dynamic Inverted Ground Contact Shadow */}
          <div
            className="pointer-events-none absolute -bottom-2 inset-x-8 h-8 rounded-full bg-emerald-950/20 dark:bg-black/45 blur-xl motion-safe:animate-[dynamic-ground-shadow_7.5s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]"
            style={{
              transform: `translate3d(${tilt.x * -0.6}px, ${tilt.y * -0.6}px, 0)`,
            }}
          />

          {/* Layer 1: Ambient Caustic Glow */}
          <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-lime-500/15 blur-2xl opacity-70 dark:opacity-40" />

          {/* Layer 2: 3D Floating Frosted Glass Card Rig */}
          <div
            className="group relative aspect-square overflow-hidden rounded-3xl p-2.5 bg-gradient-to-b from-white/75 via-white/45 to-white/20 dark:from-white/18 dark:via-white/10 dark:to-white/5 border border-white/85 dark:border-white/20 backdrop-blur-2xl shadow-[0_24px_54px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_28px_64px_-15px_rgba(0,0,0,0.65)] motion-safe:animate-[float-liquid-3d_7.5s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]"
            style={{
              transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Dynamic Interactive Specular Refraction Glare */}
            <div
              className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-60 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-90"
              style={{
                background: `radial-gradient(circle 240px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 40%, transparent 75%)`,
              }}
            />

            {/* Scientific Corner Reticles */}
            <div className="pointer-events-none absolute inset-3 z-30 flex flex-col justify-between text-[9px] font-mono text-emerald-600/75 dark:text-emerald-400/75 select-none">
              <div className="flex justify-between">
                <span>[ SAMPLE_ID: #0{sampleIndex + 1} ]</span>
                <span>[ BAND: 780nm-NIR ]</span>
              </div>
              <div className="flex justify-between">
                <span>[ STATUS: {STEPS[step]?.label.toUpperCase()} ]</span>
                <span>[ IOT_GRID: ACTIVE ]</span>
              </div>
            </div>

            {/* Moving Prismatic Reflection Sheen */}
            <div className="pointer-events-none absolute inset-0 z-10 opacity-30 mix-blend-color-dodge motion-safe:animate-[prismatic-shift_12s_ease-in-out_infinite]" />

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

              {/* Top Specular Bevel Refraction */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/35 via-white/10 to-transparent dark:from-white/20" />

              {/* Scan Beam */}
              {step === 1 && (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-emerald-400/90 via-emerald-500/40 to-transparent motion-safe:animate-[scan-sweep_2s_linear_infinite]" />
              )}

              {/* 3D AR Augmented Glass Bounding Boxes with Organic Floating Stagger */}
              {step >= 2 &&
                sample.leaves.map((leaf, idx) => (
                  <span
                    key={`leaf-${idx}`}
                    className="absolute animate-fade-in rounded-xl border-2 backdrop-blur-[2px] transition-all duration-300 shadow-md"
                    style={{
                      ...boxStyle({
                        x: leaf.x / 100,
                        y: leaf.y / 100,
                        w: leaf.w / 100,
                        h: leaf.h / 100,
                      }),
                      borderColor: leaf.healthy
                        ? "rgba(52, 211, 153, 0.95)"
                        : "rgba(244, 63, 94, 0.95)",
                      backgroundColor: leaf.healthy
                        ? "rgba(16, 185, 129, 0.08)"
                        : "rgba(244, 63, 94, 0.08)",
                      boxShadow: leaf.healthy
                        ? "0 0 20px rgba(16, 185, 129, 0.3), inset 0 0 10px rgba(16, 185, 129, 0.18)"
                        : "0 0 20px rgba(244, 63, 94, 0.3), inset 0 0 10px rgba(244, 63, 94, 0.18)",
                      animationDelay: `${idx * 140}ms`,
                    }}
                  >
                    {/* 3D Glass Bead Number Pill with Glare Spot */}
                    <span
                      className="absolute -left-1.5 -top-1.5 flex size-6 items-center justify-center rounded-lg text-[11px] font-extrabold font-mono text-white shadow-[0_6px_14px_rgba(0,0,0,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.85)]"
                      style={{
                        background: leaf.healthy
                          ? "linear-gradient(135deg, #34d399 0%, #059669 100%)"
                          : "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.85)",
                      }}
                    >
                      {idx + 1}
                    </span>
                  </span>
                ))}

              {/* Disease Hotspots / Liquid Water Magnifier Spot */}
              {step >= 4 &&
                sample.hotspots.map((h, idx) => (
                  <span
                    key={idx}
                    className="absolute rounded-full border-2 border-coral/95 bg-coral/25 shadow-[0_0_20px_rgba(244,63,94,0.8),inset_0_0_10px_rgba(255,255,255,0.5)] backdrop-blur-[2px] motion-safe:animate-[pulse-soft_2s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]"
                    style={{
                      ...spotStyle({ x: h.x / 100, y: h.y / 100, r: h.r / 100 }),
                      animationDelay: `${idx * 200}ms`,
                    }}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Stacked Glass Step Carousel List with PlantAI Smart IoT Styling */}
        <ol className="space-y-3">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = idx === step;
            const passed = idx < step;

            return (
              <li
                key={s.key}
                className={`relative flex items-center justify-between gap-3.5 rounded-2xl border px-4 py-3.5 transition-all duration-350 ${
                  active
                    ? "border-emerald-500/65 bg-gradient-to-r from-white/95 via-emerald-50/75 to-white/95 dark:from-slate-900/95 dark:via-emerald-950/60 dark:to-slate-900/95 text-foreground shadow-[0_14px_32px_-6px_rgba(47,122,63,0.32),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl -translate-y-0.5 scale-[1.01]"
                    : passed
                      ? "border-white/65 dark:border-white/12 bg-white/65 dark:bg-white/6 text-muted-foreground backdrop-blur-md shadow-xs hover:bg-white/80 dark:hover:bg-white/10"
                      : "border-white/35 dark:border-white/5 bg-white/35 dark:bg-white/4 text-muted-foreground/70 backdrop-blur-sm"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`glass-icon-3d size-8.5 shrink-0 rounded-xl transition-all duration-300 ${
                      active
                        ? "animate-[water-ripple_1.4s_cubic-bezier(0.16,1,0.3,1)] ring-2 ring-emerald-500/40"
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
                        className={`size-4 text-foreground/85 ${
                          active && s.key === "disease" ? "animate-spin" : ""
                        }`}
                        aria-hidden
                      />
                    )}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-mono font-medium text-emerald-600/80 dark:text-emerald-400/80 uppercase">
                      STAGE 0{idx + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold truncate ${
                        active ? "text-foreground font-bold" : ""
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>

                {active && (
                  <span className="relative flex size-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </span>
                )}
              </li>
            );
          })}

          {done && (
            <li className="animate-fade-in rounded-2xl border border-white/85 dark:border-white/18 bg-white/95 dark:bg-slate-900/90 p-4.5 shadow-[0_18px_36px_-6px_rgba(0,0,0,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <p className="text-lg font-extrabold text-foreground">{sample.plant}</p>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold border shadow-xs ${
                    sample.healthy
                      ? "border-emerald-500/35 bg-emerald-500/18 text-emerald-700 dark:text-emerald-300"
                      : "border-coral/35 bg-coral/18 text-coral"
                  }`}
                >
                  {sample.disease}
                </span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] motion-safe:animate-[grow-x_1s_cubic-bezier(0.16,1,0.3,1)]"
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
