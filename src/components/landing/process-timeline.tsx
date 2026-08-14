import { useEffect, useState } from "react";
import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import { usePrefersReducedMotion, useReveal } from "./use-reveal";

const STEPS = [
  {
    icon: Leaf,
    title: "Upload image",
    text: "Drag, paste or snap one leaf or many. We compress it for slow connections.",
  },
  {
    icon: ShieldCheck,
    title: "Detect leaf",
    text: "Stage one finds every leaf in the photo, one or twenty, and checks the photo quality.",
  },
  {
    icon: Leaf,
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
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 1800);
    return () => clearInterval(id);
  }, [shown, reduced]);

  return (
    <section
      ref={ref}
      id="how-it-works"
      aria-label="How the AI works"
      className="rounded-3xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">How the AI works</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-5">
        {STEPS.map((s, i) => {
          const on = i === active;
          return (
            <li
              key={s.title}
              className={`relative rounded-2xl border p-4 transition-all duration-500 ${
                on
                  ? "-translate-y-1 border-fern bg-fern/10 shadow-md"
                  : "border-border bg-background"
              }`}
            >
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  on ? "bg-fern/25" : "bg-muted"
                }`}
              >
                <s.icon
                  aria-hidden="true"
                  strokeWidth={1.6}
                  className={`size-6 text-primary transition-opacity duration-500 ${on ? "opacity-100" : "opacity-60"}`}
                />
              </span>

              <h3 className="mt-3 text-sm font-bold text-foreground">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.text}</p>
              <span
                className="mt-3 block h-1 rounded-full bg-fern transition-all duration-500"
                style={{ width: on ? "100%" : "18%", opacity: on ? 1 : 0.3 }}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
