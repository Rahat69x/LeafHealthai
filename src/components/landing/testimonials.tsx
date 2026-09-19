import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

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
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-8"
    >
      <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        What growers say
      </h2>
      <figure key={i} className="mt-5 animate-fade-in">
        <span className="glass-icon-3d size-11 rounded-2xl mb-3">
          <Quote className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
        </span>
        <blockquote className="mt-2 max-w-2xl text-base sm:text-lg font-medium text-foreground leading-relaxed">
          &ldquo;{item.text}&rdquo;
        </blockquote>
        <figcaption className="mt-4 text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <span className="text-foreground">{item.name}</span>
          <span>·</span>
          <span>{item.place}</span>
        </figcaption>
      </figure>
      <div className="mt-6 flex gap-2">
        {TESTIMONIALS.map((t, idx) => (
          <button
            key={t.name}
            type="button"
            aria-label={`Show review from ${t.name}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === i
                ? "w-8 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm"
                : "w-2.5 bg-muted hover:bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
