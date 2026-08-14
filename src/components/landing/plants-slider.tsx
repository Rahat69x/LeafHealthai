import { Leaf } from "lucide-react";

import { SUPPORTED_PLANTS } from "@/lib/landing-data";

export function PlantsSlider() {
  const row = [...SUPPORTED_PLANTS, ...SUPPORTED_PLANTS];

  return (
    <section
      aria-label="Supported plants"
      className="rounded-3xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">Supported plants</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        32 crops and counting, each with a checked disease list.
      </p>

      <div className="group mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <ul className="flex w-max gap-4 motion-safe:animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
          {row.map((p, i) => (
            <li
              key={`${p.name}-${i}`}
              aria-hidden={i >= SUPPORTED_PLANTS.length}
              className="w-40 shrink-0 rounded-2xl border border-border bg-background p-4 text-center"
            >
              <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-fern/15 text-foreground">
                <Leaf className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-2 text-sm font-bold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.diseases} diseases</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
