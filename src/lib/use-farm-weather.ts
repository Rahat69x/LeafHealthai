import { useEffect, useState } from "react";

import { getHourlyOutlook, cachedOutlook, type HourlyOutlook } from "./hourly-weather";
import {
  cacheReport,
  cachedReport,
  currentPosition,
  getWeatherReport,
  placeFromCoords,
  type WeatherReport,
} from "./weather";

export interface FarmWeather {
  report: WeatherReport | null;
  outlook: HourlyOutlook | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Gets the weather for the farmer's area once, and keeps it for the whole app. */
export function useFarmWeather(): FarmWeather {
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [outlook, setOutlook] = useState<HourlyOutlook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const cachedReportValue = cachedReport();
    const cachedHours = cachedOutlook();
    if (cachedReportValue) setReport(cachedReportValue);
    if (cachedHours) setOutlook(cachedHours);

    async function run() {
      setLoading(true);
      setError(null);
      try {
        let base = cachedReportValue;
        const fresh = !base || Date.now() - new Date(base.updatedAt).getTime() > 30 * 60 * 1000;
        if (fresh) {
          let place;
          if (base) {
            place = {
              name: base.place,
              country: "",
              latitude: base.latitude,
              longitude: base.longitude,
            };
          } else {
            const position = await currentPosition();
            place = await placeFromCoords(position.coords.latitude, position.coords.longitude);
          }
          base = await getWeatherReport(place);
          cacheReport(base);
        }
        if (!alive || !base) return;
        setReport(base);
        const hours = await getHourlyOutlook(base.latitude, base.longitude);
        if (alive) setOutlook(hours);
      } catch {
        if (alive && !cachedReportValue)
          setError(
            "We could not read the weather for your area. Set your area on the weather page.",
          );
      } finally {
        if (alive) setLoading(false);
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [tick]);

  return { report, outlook, loading, error, reload: () => setTick((value) => value + 1) };
}
