import { useState } from "react";
import { Sparkles } from "lucide-react";

import { SAMPLES } from "@/lib/landing-data";

export function InteractiveScan() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      aria-label="Interactive scan preview"
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Try a mock scan
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden /> Hover
            or tap a sample leaf to see the scanner run.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4.5 sm:grid-cols-3">
        {SAMPLES.map((s, i) => {
          const on = hovered === i;
          return (
            <button
              key={s.plant}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered((h) => (h === i ? null : h))}
              onClick={() => setHovered((h) => (h === i ? null : i))}
              aria-pressed={on}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/60 dark:border-white/15 bg-muted text-left shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
            >
              <img
                src={s.src}
                alt={`${s.plant} sample leaf`}
                loading="lazy"
                decoding="async"
                width={768}
                height={768}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {on && (
                <>
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-fern/80 to-transparent motion-safe:animate-[scan-sweep_1.6s_linear_infinite]" />
                  {s.hotspots.map((h, idx) => (
                    <span
                      key={idx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/25 shadow-[0_0_12px_rgba(244,63,94,0.6)] motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]"
                      style={{
                        left: `${h.x}%`,
                        top: `${h.y}%`,
                        width: `${h.r * 2}%`,
                        height: `${h.r * 2}%`,
                      }}
                    />
                  ))}
                  <div className="absolute inset-x-2.5 bottom-2.5 animate-fade-in rounded-xl border border-white/80 dark:border-white/15 bg-white/90 dark:bg-slate-900/85 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl">
                    <p className="text-sm font-bold text-foreground">
                      {s.plant} · {s.disease}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.confidence}% confidence (sample)
                    </p>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
