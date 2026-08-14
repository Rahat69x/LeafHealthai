import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AreaInfo } from "@/components/area-info";
import { DiseaseForecast } from "@/components/disease-forecast";
import { HourlyForecast } from "@/components/hourly-forecast";
import { RadarMap } from "@/components/radar-map";
import { PlantHealthInsights } from "@/components/plant-health-insights";
import { PreventionPlan } from "@/components/prevention-plan";
import { RegionPicker } from "@/components/region-picker";
import { RiskExplainer } from "@/components/risk-explainer";
import { RiskMap } from "@/components/risk-map";
import { SmartTips } from "@/components/smart-tips";
import { WeatherAlerts } from "@/components/weather-alerts";
import { WeatherCharts } from "@/components/weather-charts";
import { WeatherMetrics } from "@/components/weather-metrics";
import { WeatherSkeleton } from "@/components/weather-skeleton";
import { assess } from "@/lib/agri-intelligence";
import type { AnalysisResult } from "@/lib/demo-analysis";
import { loadHistory } from "@/lib/history";
import { getHourlyOutlook, type HourPoint } from "@/lib/hourly-weather";
import type { Area } from "@/lib/regions";
import {
  cacheReport,
  cachedReport,
  currentPosition,
  getWeatherReport,
  placeFromCoords,
  seasonOf,
  type Place,
  type WeatherReport,
} from "@/lib/weather";

const TITLE = "Weather disease risk engine | LeafCheck";
const DESCRIPTION =
  "An agricultural decision support dashboard: live weather, a multi factor disease risk engine, a 7 day disease forecast, and prevention advice with the reason behind every step.";

const REFRESH_MS = 10 * 60 * 1000;
const FALLBACK: Place = { name: "Dhaka", country: "Bangladesh", latitude: 23.81, longitude: 90.41 };

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState<HourPoint[]>([]);

  const load = useCallback(async (next: Place, quiet = false) => {
    setLoading(true);
    setPlace(next);
    try {
      const data = await getWeatherReport(next);
      setReport(data);
      cacheReport(data);
      // The hourly strip and charts are extra detail, so a failure here must not break the page.
      getHourlyOutlook(next.latitude, next.longitude)
        .then((outlook) => setHours(outlook.hours))
        .catch(() => setHours([]));
    } catch {
      if (!quiet) toast.error("We could not get the weather. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setHistory(loadHistory());
    const saved = cachedReport();
    if (saved) setReport(saved);
    currentPosition()
      .then((position) => placeFromCoords(position.coords.latitude, position.coords.longitude))
      .then((found) => load(found, true))
      .catch(() => {
        if (!saved) void load(FALLBACK, true);
      });
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (place && navigator.onLine) void load(place, true);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [place, load]);

  const season = seasonOf(new Date(), report?.latitude ?? 23.8);

  const assessment = useMemo(
    () =>
      report
        ? assess({
            report,
            season,
            history,
            place: area ? `${area.city}, ${area.district}` : report.place,
          })
        : null,
    [report, season, history, area],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Weather and disease risk engine
        </h1>
        <p className="mt-3 max-w-3xl text-base text-muted-foreground">
          This page does not just show weather. It combines live conditions, the 7 day forecast, the
          season, your area and your past leaf scans to estimate how likely a disease outbreak is,
          and what to do about it before it starts.
        </p>
      </header>

      <RegionPicker
        busy={loading}
        onSelect={(next, picked) => {
          setArea(picked ?? null);
          void load(next);
        }}
      />

      {loading && !report && <WeatherSkeleton />}

      {report && assessment && (
        <>
          <RiskExplainer assessment={assessment} />
          <WeatherMetrics report={report} />
          <WeatherAlerts alerts={report.alerts} />
          <PlantHealthInsights report={report} />
          {hours.length > 0 && (
            <>
              <HourlyForecast hours={hours} />
              <WeatherCharts hours={hours} />
            </>
          )}
          <RadarMap latitude={report.latitude} longitude={report.longitude} place={report.place} />
          <DiseaseForecast assessment={assessment} />
          <PreventionPlan items={assessment.recommendations} place={assessment.place} />
          <SmartTips
            report={report}
            season={season}
            plant={history[0]?.plant}
            disease={history[0]?.disease}
            area={assessment.place}
          />
        </>
      )}

      <AreaInfo />
      <RiskMap />

      <p className="text-xs text-muted-foreground">
        Weather data comes from Open-Meteo. A confirmed disease can only come from a leaf photo
        check. Everything on this page is an environmental risk estimate, so please ask a local
        plant expert before using any chemical.
      </p>
    </div>
  );
}
