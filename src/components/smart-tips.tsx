import { Droplet, Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  SEASON_NOTES,
  farmingTips,
  smartRecommendations,
  type Season,
  type WeatherReport,
} from "@/lib/weather";

export function SmartTips({
  report,
  season,
  plant,
  disease,
  area,
}: {
  report: WeatherReport;
  season: Season;
  plant?: string | undefined;
  disease?: string | undefined;
  area?: string | undefined;
}) {
  const tips = farmingTips(report, season, plant);
  const advice = smartRecommendations({ report, season, plant, disease, area });

  const rows = [
    { icon: Droplet, label: "Best time to water", value: advice.watering },
    { icon: Droplet, label: "Best time to spray", value: advice.spraying },
    { icon: Leaf, label: "Fertiliser", value: advice.fertiliser },
    { icon: Leaf, label: "Organic treatment", value: advice.organic },
    { icon: Leaf, label: "Harvest care", value: advice.harvest },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section
        className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
        aria-labelledby="season-heading"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="season-heading" className="text-lg font-bold text-foreground">
            Season and daily tips
          </h2>
          <Badge variant="outline" className="rounded-full">
            {season} season
          </Badge>
        </div>
        <p className="mt-2 text-sm text-foreground">{SEASON_NOTES[season].text}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Watch for: {SEASON_NOTES[season].diseases.join(", ")}
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
        aria-labelledby="smart-heading"
      >
        <h2 id="smart-heading" className="text-lg font-bold text-foreground">
          Smart recommendations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{advice.note}</p>
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="flex gap-3 rounded-2xl border bg-muted/30 p-3">
              <row.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{row.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{row.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
