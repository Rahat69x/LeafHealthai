import { Droplet, ShieldCheck } from "lucide-react";

import type { WeatherAlert } from "@/lib/weather";

const tone: Record<WeatherAlert["tone"], string> = {
  danger: "border-destructive/40 bg-destructive/10 text-destructive-ink",
  warn: "border-amber/50 bg-amber/15 text-foreground",
  info: "border-border bg-muted/40 text-foreground",
};

const icon: Record<WeatherAlert["tone"], typeof ShieldCheck> = {
  danger: Droplet,
  warn: ShieldCheck,
  info: ShieldCheck,
};

export function WeatherAlerts({ alerts }: { alerts: WeatherAlert[] }) {
  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="alerts-heading"
    >
      <h2 id="alerts-heading" className="text-lg font-bold text-foreground">
        Weather alerts
      </h2>
      {alerts.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No weather warnings right now. The day looks calm.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {alerts.map((alert) => {
            const Icon = icon[alert.tone];
            return (
              <li
                key={alert.title}
                className={`flex gap-3 rounded-2xl border p-3 ${tone[alert.tone]}`}
              >
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="mt-0.5 text-sm opacity-90">{alert.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
