import { useEffect, useMemo, useState } from "react";
import { Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { riskTone } from "@/components/weather-card";
import { AREAS, type Area } from "@/lib/regions";
import { levelFromScore, seasonOf, SEASON_NOTES, type RiskLevel } from "@/lib/weather";

interface Point {
  area: Area;
  level: RiskLevel;
  temperature: number;
  humidity: number;
  rainChance: number;
}

const dotTone: Record<RiskLevel, string> = {
  Low: "bg-fern",
  Medium: "bg-amber",
  High: "bg-destructive",
  "Very High": "bg-destructive",
};

async function loadAreaRisks(): Promise<Point[]> {
  const lat = AREAS.map((area) => area.latitude).join(",");
  const lon = AREAS.map((area) => area.longitude).join(",");
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_probability_max&forecast_days=1&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("map weather failed");
  const raw = (await response.json()) as
    | {
        current: { temperature_2m: number; relative_humidity_2m: number; wind_speed_10m: number };
        daily: { precipitation_probability_max: (number | null)[] };
      }[]
    | {
        current: { temperature_2m: number; relative_humidity_2m: number; wind_speed_10m: number };
        daily: { precipitation_probability_max: (number | null)[] };
      };
  const list = Array.isArray(raw) ? raw : [raw];

  return AREAS.map((area, index) => {
    const entry = list[index] ?? list[0]!;
    const temperature = Math.round(entry.current.temperature_2m);
    const humidity = Math.round(entry.current.relative_humidity_2m);
    const wind = Math.round(entry.current.wind_speed_10m);
    const rainChance = Math.round(entry.daily.precipitation_probability_max?.[0] ?? 0);
    let score = 0;
    if (humidity >= 85) score += 3;
    else if (humidity >= 70) score += 2;
    else if (humidity >= 60) score += 1;
    if (rainChance >= 70) score += 2;
    else if (rainChance >= 40) score += 1;
    if (temperature >= 18 && temperature <= 30) score += 2;
    if (wind < 6) score += 1;
    return { area, level: levelFromScore(score), temperature, humidity, rainChance };
  });
}

export function RiskMap() {
  const [points, setPoints] = useState<Point[] | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Point | null>(null);

  useEffect(() => {
    loadAreaRisks()
      .then((next) => {
        setPoints(next);
        setSelected(next[0] ?? null);
      })
      .catch(() => setError(true));
  }, []);

  const bounds = useMemo(() => {
    const lats = AREAS.map((area) => area.latitude);
    const lons = AREAS.map((area) => area.longitude);
    return {
      minLat: Math.min(...lats) - 1.5,
      maxLat: Math.max(...lats) + 1.5,
      minLon: Math.min(...lons) - 1.5,
      maxLon: Math.max(...lons) + 1.5,
    };
  }, []);

  function position(area: Area) {
    const x = ((area.longitude - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 100;
    const y = (1 - (area.latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { left: `${x}%`, top: `${y}%` };
  }

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="map-heading"
    >
      <h2 id="map-heading" className="text-lg font-bold text-foreground">
        Disease risk map
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap any place on the map to see the weather, risk level and prevention tips for that area.
      </p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-fern" aria-hidden="true" /> Low risk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-amber" aria-hidden="true" /> Medium risk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-destructive" aria-hidden="true" /> High risk
        </span>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-muted/30"
          role="group"
          aria-label="Disease risk map"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-6"
          >
            {Array.from({ length: 36 }).map((_, index) => (
              <span key={index} className="border-r border-b border-border/40" />
            ))}
          </div>
          {!points && !error && (
            <div className="absolute inset-0 grid place-items-center">
              <Leaf className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          {error && (
            <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted-foreground">
              The map needs internet. Please connect and try again.
            </p>
          )}
          {points?.map((point) => (
            <button
              key={point.area.city}
              type="button"
              onClick={() => setSelected(point)}
              style={position(point.area)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                selected?.area.city === point.area.city ? "scale-125" : ""
              }`}
              aria-label={`${point.area.city}: ${point.level} risk`}
            >
              <span
                className={`block size-3.5 rounded-full ring-2 ring-background sm:size-4 ${dotTone[point.level]}`}
              />
            </button>
          ))}
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          {selected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-bold text-foreground">
                  {selected.area.city}, {selected.area.country}
                </p>
                <Badge variant="outline" className={`rounded-full ${riskTone[selected.level]}`}>
                  {selected.level} risk
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Temp", value: `${selected.temperature}°C` },
                  { label: "Humidity", value: `${selected.humidity}%` },
                  { label: "Rain", value: `${selected.rainChance}%` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border bg-card p-2">
                    <p className="text-[11px] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Common diseases</p>
                <p className="text-sm text-muted-foreground">
                  {selected.area.commonDiseases.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Prevention tips</p>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {selected.area.prevention.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                {SEASON_NOTES[seasonOf(new Date(), selected.area.latitude)].text}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a place on the map to see the details.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
