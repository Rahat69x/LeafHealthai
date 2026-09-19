import { useEffect, useState } from "react";
import { Droplet, Leaf, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

import { usePrefersReducedMotion, useReveal } from "./use-reveal";

const STEPS = [
  {
    icon: Leaf,
    title: "Upload image",
    text: "Drag, paste or snap one leaf or many. We compress it for slow connections.",
  },
  {
    icon: Sparkles,
    title: "Detect leaf",
    text: "Stage one finds every leaf in the photo, one or twenty, and checks the photo quality.",
  },
  {
    icon: Wand2,
    title: "AI analysis",
    text: "Vision model reads colour, texture and lesion shape across the blade.",
  },
  {
    icon: ShieldCheck,
    title: "Disease detection",
    text: "Top matches with confidence, severity and the symptoms behind the call.",
  },
  {
    icon: Droplet,
    title: "Treatment advice",
    text: "Organic first, chemicals only above 80% confidence, tuned to your weather.",
  },
];

export function ProcessTimeline() {
  const { ref, shown } = useReveal<HTMLElement>();
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!shown || reduced) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 2200);
    return () => clearInterval(id);
  }, [shown, reduced]);

  return (
    <section
      ref={ref}
      id="how-it-works"
      aria-label="How the AI works"
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            How the AI works
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A 5-stage vision and agronomy pipeline executing on every scan.
          </p>
        </div>
        <span className="rounded-full border border-white/60 dark:border-white/15 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-md">
          Step {active + 1} of 5
        </span>
      </div>

      <ol className="mt-7 grid gap-4 md:grid-cols-5">
        {STEPS.map((s, i) => {
          const on = i === active;
          const Icon = s.icon;

          return (
            <li
              key={s.title}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-500 ${
                on
                  ? "-translate-y-1.5 border-emerald-500/50 bg-white/90 dark:bg-emerald-950/40 shadow-[0_12px_28px_-6px_rgba(47,122,63,0.25),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl"
                  : "border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-sm backdrop-blur-md hover:bg-white/80"
              }`}
            >
              <span
                className={`glass-icon-3d size-12 shrink-0 rounded-2xl transition-all duration-300 ${
                  on
                    ? "animate-[water-ripple_1.2s_ease-out] shadow-[0_4px_16px_rgba(47,122,63,0.35)]"
                    : ""
                }`}
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className={`size-6 transition-all duration-500 ${
                    on ? "text-emerald-600 dark:text-emerald-400 scale-105" : "text-foreground/70"
                  }`}
                />
              </span>

              <h3 className="mt-3.5 text-sm font-bold text-foreground">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.text}</p>

              <span
                className="mt-3.5 block h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm transition-all duration-500"
                style={{
                  width: on ? "100%" : "18%",
                  opacity: on ? 1 : 0.25,
                }}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
