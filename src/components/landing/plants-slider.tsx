import { Leaf } from "lucide-react";

import { SUPPORTED_PLANTS } from "@/lib/landing-data";

export function PlantsSlider() {
  const row = [...SUPPORTED_PLANTS, ...SUPPORTED_PLANTS];

  return (
    <section
      aria-label="Supported plants"
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-8"
    >
      <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        Supported plants
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        32 crops and counting, each with a checked disease list.
      </p>

      <div className="group mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <ul className="flex w-max gap-4 motion-safe:animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
          {row.map((p, i) => (
            <li
              key={`${p.name}-${i}`}
              aria-hidden={i >= SUPPORTED_PLANTS.length}
              className="w-44 shrink-0 rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="mx-auto glass-icon-3d size-12 rounded-2xl">
                <Leaf className="size-5.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-bold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.diseases} diseases</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
