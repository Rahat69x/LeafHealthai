import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import type { WeatherReport } from "@/lib/weather";

export function WeatherMetrics({ report }: { report: WeatherReport }) {
  const now = report.now;
  const items = [
    { icon: Droplet, label: "Temperature", value: `${now.temperature}°C` },
    { icon: Leaf, label: "Feels like", value: `${now.feelsLike}°C` },
    { icon: Droplet, label: "Humidity", value: `${now.humidity}%` },
    { icon: Droplet, label: "Rain chance", value: `${now.rainChance}%` },
    { icon: Leaf, label: "Rainfall today", value: `${now.rainfall} mm` },
    { icon: Droplet, label: "Wind", value: `${now.wind} km/h ${now.windName}` },
    { icon: Droplet, label: "Wind gusts", value: `${now.windGust} km/h` },
    { icon: Droplet, label: "UV index", value: `${now.uvIndex}` },
    { icon: Leaf, label: "Air pressure", value: `${now.pressure} hPa` },
    { icon: Leaf, label: "Cloud cover", value: `${now.cloudCover}%` },
    { icon: ShieldCheck, label: "Visibility", value: `${now.visibility} km` },
    { icon: Leaf, label: "Dew point", value: `${now.dewPoint}°C` },
    { icon: Leaf, label: "Leaf wetness", value: `${now.leafWetnessHours} h damp` },
    {
      icon: Leaf,
      label: "Air quality",
      value:
        now.airQuality === null
          ? now.airQualityLabel
          : `${now.airQuality} · ${now.airQualityLabel}`,
    },
    { icon: Leaf, label: "Sunrise", value: now.sunrise },
    { icon: Leaf, label: "Sunset", value: now.sunset },
    { icon: Droplet, label: "Moon", value: `${now.moonName} · ${now.moonIllumination}%` },
  ];

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="metrics-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="metrics-heading" className="text-lg font-bold text-foreground">
          Live field conditions
        </h2>
        <p className="text-xs text-muted-foreground">
          {report.place} · updated{" "}
          {new Date(report.updatedAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border bg-muted/40 p-3">
            <item.icon className="size-4 text-primary" aria-hidden="true" />
            <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
            <p className="text-base font-bold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
