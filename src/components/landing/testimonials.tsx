import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

import { TESTIMONIALS } from "@/lib/landing-data";
import { usePrefersReducedMotion } from "./use-reveal";

export function Testimonials() {
  const [i, setI] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, [reduced]);

  const item = TESTIMONIALS[i]!;

  return (
    <section
      aria-label="What growers say"
      className="rounded-3xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">What growers say</h2>
      <figure key={i} className="mt-5 animate-fade-in">
        <Leaf className="h-6 w-6 text-fern-ink" aria-hidden />
        <blockquote className="mt-2 max-w-2xl text-base text-foreground">{item.text}</blockquote>
        <figcaption className="mt-3 text-sm text-muted-foreground">
          {item.name} — {item.place}
        </figcaption>
      </figure>
      <div className="mt-5 flex gap-2">
        {TESTIMONIALS.map((t, idx) => (
          <button
            key={t.name}
            type="button"
            aria-label={`Show review from ${t.name}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-fern" : "w-2 bg-muted"}`}
          />
        ))}
      </div>
    </section>
  );
}
