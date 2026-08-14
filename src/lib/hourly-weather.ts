/** Hour by hour weather for the next two days. Used by the charts and the spray and water advisors. */

import { fetchJson } from "./net";

export interface HourPoint {
  time: string;
  temperature: number;
  humidity: number;
  rainChance: number;
  rain: number;
  wind: number;
  windGust: number;
  uvIndex: number;
  pressure: number;
  cloudCover: number;
  dewPoint: number;
}

export interface HourlyOutlook {
  hours: HourPoint[];
  updatedAt: string;
}

const CACHE_KEY = "leafcheck.hourly.v1";

export async function getHourlyOutlook(
  latitude: number,
  longitude: number,
): Promise<HourlyOutlook> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,uv_index,surface_pressure,cloud_cover,dew_point_2m` +
    `&forecast_days=3&timezone=auto`;
  const data = await fetchJson<{
    hourly: {
      time: string[];
      temperature_2m: number[];
      relative_humidity_2m: number[];
      precipitation_probability: (number | null)[];
      precipitation: (number | null)[];
      wind_speed_10m: number[];
      wind_gusts_10m?: (number | null)[];
      uv_index?: (number | null)[];
      surface_pressure?: (number | null)[];
      cloud_cover?: (number | null)[];
      dew_point_2m?: (number | null)[];
    };
  }>(url, { cacheMs: 5 * 60 * 1000 });

  const now = Date.now();
  const hours: HourPoint[] = data.hourly.time
    .map((time, index) => ({
      time,
      temperature: Math.round(data.hourly.temperature_2m[index] ?? 0),
      humidity: Math.round(data.hourly.relative_humidity_2m[index] ?? 0),
      rainChance: Math.round(data.hourly.precipitation_probability?.[index] ?? 0),
      rain: Math.round((data.hourly.precipitation?.[index] ?? 0) * 10) / 10,
      wind: Math.round(data.hourly.wind_speed_10m[index] ?? 0),
      windGust: Math.round(
        data.hourly.wind_gusts_10m?.[index] ?? data.hourly.wind_speed_10m[index] ?? 0,
      ),
      uvIndex: Math.round(data.hourly.uv_index?.[index] ?? 0),
      pressure: Math.round(data.hourly.surface_pressure?.[index] ?? 1013),
      cloudCover: Math.round(data.hourly.cloud_cover?.[index] ?? 0),
      dewPoint: Math.round(data.hourly.dew_point_2m?.[index] ?? 0),
    }))
    .filter((hour) => new Date(hour.time).getTime() >= now - 60 * 60 * 1000)
    .slice(0, 48);

  const outlook = { hours, updatedAt: new Date().toISOString() };
  cacheOutlook(outlook);
  return outlook;
}

export function cacheOutlook(outlook: HourlyOutlook) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(outlook));
  } catch {
    /* optional */
  }
}

export function cachedOutlook(): HourlyOutlook | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as HourlyOutlook) : null;
  } catch {
    return null;
  }
}

export function clockLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const same = date.toDateString() === today.toDateString();
  const tomorrow = new Date(today.getTime() + 86400000).toDateString() === date.toDateString();
  if (same) return "Today";
  if (tomorrow) return "Tomorrow";
  return date.toLocaleDateString(undefined, { weekday: "long" });
}
