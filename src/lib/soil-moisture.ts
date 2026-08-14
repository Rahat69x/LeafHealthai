/** Soil moisture, estimated from rain, heat and humidity, and checked against the model soil layer. */

import { fetchJson } from "./net";
import type { HourPoint } from "./hourly-weather";

export type SoilBand = "Dry" | "Normal" | "Moist" | "Wet" | "Very Wet";

export interface SoilReport {
  band: SoilBand;
  /** 0-100, a rough share of how full the topsoil is. */
  percent: number;
  confidence: number;
  source: "measured model" | "estimated from weather";
  rainLast48: number;
  rainNext24: number;
  advice: string[];
}

const BAND_ORDER: SoilBand[] = ["Dry", "Normal", "Moist", "Wet", "Very Wet"];

function bandOf(percent: number): SoilBand {
  if (percent < 20) return "Dry";
  if (percent < 40) return "Normal";
  if (percent < 60) return "Moist";
  if (percent < 80) return "Wet";
  return "Very Wet";
}

function adviceFor(band: SoilBand, rainNext24: number): string[] {
  const list: string[] = [];
  if (band === "Dry") {
    list.push("Irrigate today. Water early morning or late afternoon so less is lost to the sun.");
    list.push("Mulch with straw or leaves to hold the little water that is left.");
  }
  if (band === "Normal") {
    list.push("Soil water is about right. Keep to your normal watering routine.");
    if (rainNext24 < 2) list.push("No rain is coming, so plan a light irrigation tomorrow.");
  }
  if (band === "Moist") {
    list.push("There is enough water in the root zone. Skip today's irrigation and save fuel.");
  }
  if (band === "Wet" || band === "Very Wet") {
    list.push("Do not irrigate. Open the drains so water can leave the field.");
    list.push(
      "Wet soil invites root rot and wilt. Avoid walking or driving on the field until it firms up.",
    );
  }
  if (rainNext24 >= 15)
    list.push(`About ${rainNext24} mm of rain is expected in 24 hours, so hold back all watering.`);
  return list;
}

/**
 * Open-Meteo publishes a modelled soil moisture layer. When it is available we use
 * it directly; otherwise we fall back to a rain and evaporation balance.
 */
export async function getSoilReport(
  latitude: number,
  longitude: number,
  hours: HourPoint[],
): Promise<SoilReport> {
  const rainNext24 =
    Math.round(hours.slice(0, 24).reduce((sum, hour) => sum + hour.rain, 0) * 10) / 10;
  let rainLast48 = 0;
  let modelled: number | null = null;

  try {
    const data = await fetchJson<{
      hourly: {
        soil_moisture_0_to_1cm?: (number | null)[];
        soil_moisture_1_to_3cm?: (number | null)[];
        precipitation?: (number | null)[];
      };
    }>(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&hourly=soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,precipitation&past_days=2&forecast_days=1&timezone=auto`,
      { cacheMs: 15 * 60 * 1000 },
    );
    const top = data.hourly.soil_moisture_0_to_1cm ?? [];
    const deep = data.hourly.soil_moisture_1_to_3cm ?? [];
    const last = [...top].reverse().find((value) => typeof value === "number");
    const lastDeep = [...deep].reverse().find((value) => typeof value === "number");
    const rain = data.hourly.precipitation ?? [];
    rainLast48 =
      Math.round(rain.slice(0, 48).reduce<number>((sum, value) => sum + (value ?? 0), 0) * 10) / 10;
    if (typeof last === "number") {
      // The model reports m³/m³; roughly 0.45 is saturated soil.
      const blend = typeof lastDeep === "number" ? (last + lastDeep) / 2 : last;
      modelled = Math.round(Math.min(1, blend / 0.45) * 100);
    }
  } catch {
    /* fall through to the estimate */
  }

  if (modelled !== null) {
    const band = bandOf(modelled);
    return {
      band,
      percent: modelled,
      confidence: 82,
      source: "measured model",
      rainLast48,
      rainNext24,
      advice: adviceFor(band, rainNext24),
    };
  }

  // Fallback: recent rain adds water, heat and dry air take it away.
  const recent = hours.slice(0, 12);
  const avgTemp = recent.length
    ? recent.reduce((sum, hour) => sum + hour.temperature, 0) / recent.length
    : 28;
  const avgHumidity = recent.length
    ? recent.reduce((sum, hour) => sum + hour.humidity, 0) / recent.length
    : 70;
  const dryingLoss = Math.max(0, (avgTemp - 20) * 1.6) + Math.max(0, (60 - avgHumidity) * 0.5);
  const percent = Math.max(
    2,
    Math.min(100, Math.round(30 + rainLast48 * 3 + rainNext24 * 1.2 - dryingLoss)),
  );
  const band = bandOf(percent);
  return {
    band,
    percent,
    confidence: 58,
    source: "estimated from weather",
    rainLast48,
    rainNext24,
    advice: adviceFor(band, rainNext24),
  };
}

export function soilTone(band: SoilBand): string {
  const index = BAND_ORDER.indexOf(band);
  if (index <= 0) return "text-destructive";
  if (index >= 3) return "text-sky";
  return "text-fern";
}
