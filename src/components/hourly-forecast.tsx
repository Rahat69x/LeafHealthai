import { Droplet } from "lucide-react";

import { clockLabel, dayLabel, type HourPoint } from "@/lib/hourly-weather";

/** Hour by hour strip for the next 24 hours. */
export function HourlyForecast({ hours }: { hours: HourPoint[] }) {
  const list = hours.slice(0, 24);
  if (list.length === 0) return null;

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="hourly-heading"
    >
      <h2 id="hourly-heading" className="text-lg font-bold text-foreground">
        Hour by hour, next 24 hours
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use this to pick a dry, calm hour for spraying or field work.
      </p>

      <ul className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2" aria-label="Hourly forecast">
        {list.map((hour, index) => (
          <li
            key={hour.time}
            className="w-28 shrink-0 snap-start rounded-2xl border bg-muted/40 p-3 text-center"
          >
            <p className="text-xs font-semibold text-muted-foreground">
              {index === 0 ? "Now" : clockLabel(hour.time)}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">{hour.temperature}°C</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Droplet className="size-3" aria-hidden="true" /> {hour.rainChance}%
            </p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Droplet className="size-3" aria-hidden="true" /> {hour.humidity}%
            </p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Droplet className="size-3" aria-hidden="true" /> {hour.wind}
            </p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Droplet className="size-3" aria-hidden="true" /> UV {hour.uvIndex}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              {dayLabel(hour.time)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
