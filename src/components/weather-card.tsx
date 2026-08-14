import { useCallback, useEffect, useRef, useState } from "react";
import { Droplet, Leaf } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import {
  cacheReport,
  cachedReport,
  currentPosition,
  findPlace,
  getWeatherReport,
  placeFromCoords,
  type Place,
  type WeatherReport,
} from "@/lib/weather";

export const riskTone: Record<string, string> = {
  Low: "border-fern/40 bg-fern/15 text-fern-ink",
  Medium: "border-amber/50 bg-amber/20 text-amber-ink",
  High: "border-destructive/40 bg-destructive/10 text-destructive-ink",
  "Very High": "border-destructive bg-destructive/20 text-destructive-ink",
};

const REFRESH_MS = 10 * 60 * 1000;

export function WeatherCard({
  onPlace,
  onReport,
  autoLocate = false,
}: {
  onPlace?: (place: string) => void;
  onReport?: (report: WeatherReport) => void;
  autoLocate?: boolean;
}) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const lastPlace = useRef<Place | null>(null);

  const publish = useCallback(
    (next: WeatherReport) => {
      setReport(next);
      onPlace?.(next.place);
      onReport?.(next);
    },
    [onPlace, onReport],
  );

  const run = useCallback(
    async (load: () => Promise<WeatherReport>, quiet = false) => {
      setLoading(true);
      try {
        const next = await load();
        setFromCache(false);
        cacheReport(next);
        publish(next);
      } catch {
        if (!quiet) toast.error("We could not get the weather. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [publish],
  );

  const loadPlace = useCallback(
    (place: Place, quiet = false) => {
      lastPlace.current = place;
      return run(() => getWeatherReport(place), quiet);
    },
    [run],
  );

  useEffect(() => {
    const saved = cachedReport();
    if (saved) {
      setFromCache(true);
      publish(saved);
      lastPlace.current = {
        name: saved.place,
        country: "",
        latitude: saved.latitude,
        longitude: saved.longitude,
      };
    }
    if (autoLocate && navigator.onLine) {
      currentPosition()
        .then((position) => placeFromCoords(position.coords.latitude, position.coords.longitude))
        .then((place) => loadPlace(place, true))
        .catch(() => {
          if (!saved)
            void loadPlace(
              { name: "Dhaka", country: "Bangladesh", latitude: 23.81, longitude: 90.41 },
              true,
            );
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (lastPlace.current && navigator.onLine) void loadPlace(lastPlace.current, true);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadPlace]);

  async function byName() {
    if (!query.trim()) return;
    await run(async () => {
      const place = await findPlace(query);
      if (!place) throw new Error("not found");
      lastPlace.current = place;
      return getWeatherReport(place);
    });
  }

  async function byGps() {
    await run(async () => {
      const position = await currentPosition();
      const place = await placeFromCoords(position.coords.latitude, position.coords.longitude);
      lastPlace.current = place;
      return getWeatherReport(place);
    });
  }

  const now = report?.now;

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="weather-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="weather-heading" className="text-lg font-bold text-foreground">
          {t("weatherTitle")}
        </h2>
        {report && (
          <Button
            variant="ghost"
            size="sm"
            className="min-h-9 rounded-full"
            onClick={() => lastPlace.current && loadPlace(lastPlace.current)}
            disabled={loading}
          >
            <Leaf className={loading ? "animate-spin" : ""} aria-hidden="true" /> Refresh
          </Button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Wet and warm days help leaf disease grow. Weather updates by itself every 10 minutes.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && byName()}
          placeholder="Search any city"
          aria-label="Search any city"
          className="min-h-11"
        />
        <Button className="min-h-11" onClick={byName} disabled={loading}>
          {loading ? <Leaf className="animate-spin" aria-hidden="true" /> : null} Check
        </Button>
        <Button variant="outline" className="min-h-11" onClick={byGps} disabled={loading}>
          <Droplet aria-hidden="true" /> Use my location
        </Button>
      </div>

      {report && now && (
        <div className="mt-5 animate-fade-in space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{report.place}</p>
              <p className="text-xs text-muted-foreground">
                {fromCache ? "Saved copy (no internet)" : "Updated"} at{" "}
                {new Date(report.updatedAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 rounded-full ${riskTone[report.level] ?? ""}`}
            >
              {report.level} risk today
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: Droplet, label: "Temperature", value: `${now.temperature}°C` },
              { icon: Droplet, label: "Humidity", value: `${now.humidity}%` },
              { icon: Droplet, label: "Rain chance", value: `${now.rainChance}%` },
              { icon: Droplet, label: "Wind speed", value: `${now.wind} km/h` },
              { icon: Droplet, label: "UV index", value: `${now.uvIndex}` },
              {
                icon: Leaf,
                label: "Air quality",
                value:
                  now.airQuality === null
                    ? now.airQualityLabel
                    : `${now.airQuality} · ${now.airQualityLabel}`,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border bg-muted/40 p-3">
                <item.icon className="size-4 text-primary" aria-hidden="true" />
                <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
                <p className="text-base font-bold text-foreground sm:text-lg">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="rounded-2xl border bg-muted/30 p-3 text-sm text-foreground">
            {report.reason}
          </p>

          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {report.advice.map((line: string) => (
              <li key={line} className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
