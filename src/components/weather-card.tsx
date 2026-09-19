import { useCallback, useEffect, useRef, useState } from "react";
import {
  CloudRain,
  Droplets,
  Gauge,
  MapPin,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
  Leaf,
} from "lucide-react";
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
  Low: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Medium: "border-amber-500/50 bg-amber-500/20 text-amber-700 dark:text-amber-300",
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
        if (!quiet) toast.success(`Weather loaded for ${next.place}.`);
      } catch (error) {
        if (!quiet) {
          toast.error(
            error instanceof Error ? error.message : "Could not load weather. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [publish],
  );

  const loadPlace = useCallback(
    (place: Place, quiet = false) => run(() => getWeatherReport(place), quiet),
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
  }, [autoLocate, loadPlace, publish]);

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
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-7"
      aria-labelledby="weather-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="weather-heading" className="text-lg font-extrabold tracking-tight text-foreground">
          {t("weatherTitle")}
        </h2>
        {report && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8.5 rounded-full text-xs"
            onClick={() => lastPlace.current && loadPlace(lastPlace.current)}
            disabled={loading}
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />{" "}
            Refresh
          </Button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Wet and warm days help leaf disease grow. Weather updates automatically every 10 minutes.
      </p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && byName()}
          placeholder="Search any city or region"
          aria-label="Search any city or region"
          className="min-h-11 rounded-xl border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-sm backdrop-blur-md"
        />
        <Button size="lg" variant="default" onClick={byName} disabled={loading}>
          {loading ? <RefreshCw className="size-4 animate-spin" aria-hidden="true" /> : null} Check
        </Button>
        <Button size="lg" variant="outline" onClick={byGps} disabled={loading}>
          <MapPin className="size-4" aria-hidden="true" /> Use my location
        </Button>
      </div>

      {report && now && (
        <div className="mt-5 animate-fade-in space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-foreground">{report.place}</p>
              <p className="text-xs text-muted-foreground">
                {fromCache ? "Saved copy (offline)" : "Updated"} at{" "}
                {new Date(report.updatedAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 rounded-full border-white/60 dark:border-white/15 px-3 py-1 shadow-sm backdrop-blur-md ${
                riskTone[report.level] ?? ""
              }`}
            >
              {report.level} risk today
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: Thermometer, label: "Temperature", value: `${now.temperature}°C` },
              { icon: Droplets, label: "Humidity", value: `${now.humidity}%` },
              { icon: CloudRain, label: "Rain chance", value: `${now.rainChance}%` },
              { icon: Wind, label: "Wind speed", value: `${now.wind} km/h` },
              { icon: Sun, label: "UV index", value: `${now.uvIndex}` },
              {
                icon: Gauge,
                label: "Air quality",
                value:
                  now.airQuality === null
                    ? now.airQualityLabel
                    : `${now.airQuality} · ${now.airQualityLabel}`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3.5 shadow-sm backdrop-blur-md"
              >
                <div className="glass-icon-3d size-8 rounded-xl mb-1.5">
                  <item.icon
                    className="size-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{item.label}</p>
                <p className="text-base font-extrabold text-foreground sm:text-lg">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 p-3.5 text-sm leading-relaxed text-foreground backdrop-blur-md">
            {report.reason}
          </p>

          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {report.advice.map((line: string) => (
              <li key={line} className="flex gap-2 items-start">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                <span className="text-xs sm:text-sm">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
