import { useState } from "react";
import { Leaf } from "lucide-react";

import { SAMPLES } from "@/lib/landing-data";

export function InteractiveScan() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      aria-label="Interactive scan preview"
      className="rounded-3xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">Try a mock scan</h2>
      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <Leaf className="h-4 w-4" aria-hidden /> Hover or tap a sample leaf to see the scanner run.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted text-left"
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
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-fern/80 to-transparent motion-safe:animate-[scan-sweep_1.6s_linear_infinite]" />
                  {s.hotspots.map((h, idx) => (
                    <span
                      key={idx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/20"
                      style={{
                        left: `${h.x}%`,
                        top: `${h.y}%`,
                        width: `${h.r * 2}%`,
                        height: `${h.r * 2}%`,
                      }}
                    />
                  ))}
                  <div className="absolute inset-x-2 bottom-2 animate-fade-in rounded-xl bg-card/95 p-3">
                    <p className="text-sm font-bold text-foreground">
                      {s.plant} · {s.disease}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
