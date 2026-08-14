/** Air quality and pollen from the Open-Meteo air quality service. Free and key free. */

import { fetchJson } from "./net";

export interface Pollutants {
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  carbonMonoxide: number | null;
  nitrogenDioxide: number | null;
  ozone: number | null;
  sulphurDioxide: number | null;
  dust: number | null;
}

export type AirBand = "Excellent" | "Good" | "Moderate" | "Poor" | "Very Poor";
export type PollenBand = "Low" | "Moderate" | "High" | "Very High";

export interface PollenReading {
  band: PollenBand;
  peak: number;
  grains: { name: string; value: number }[];
}

export interface AirReport {
  pollutants: Pollutants;
  band: AirBand;
  cropNote: string;
  pollen: PollenReading | null;
  updatedAt: string;
}

export function airBand(aqi: number | null): AirBand {
  if (aqi === null) return "Good";
  if (aqi <= 20) return "Excellent";
  if (aqi <= 40) return "Good";
  if (aqi <= 60) return "Moderate";
  if (aqi <= 100) return "Poor";
  return "Very Poor";
}

const CROP_NOTE: Record<AirBand, string> = {
  Excellent: "Clean air. Leaves can breathe and photosynthesise at full speed.",
  Good: "Air is fine for the crop. No action needed.",
  Moderate:
    "A little dust is settling on leaves. Rinse leaves with clean water in the early morning.",
  Poor: "Dust and smoke block sunlight and clog leaf pores, so growth slows. Rinse leaves and delay leaf sprays.",
  "Very Poor":
    "Heavy pollution burns leaf tips and cuts yield. Rinse leaves, avoid foliar spray and keep field workers masked.",
};

function pollenBand(peak: number): PollenBand {
  if (peak < 20) return "Low";
  if (peak < 60) return "Moderate";
  if (peak < 120) return "High";
  return "Very High";
}

export async function getAirReport(latitude: number, longitude: number): Promise<AirReport> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}` +
    `&current=european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide,dust,` +
    `alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto`;

  const data = await fetchJson<{
    current: Record<string, number | null | string>;
  }>(url, { cacheMs: 10 * 60 * 1000 });

  const current = data.current ?? {};
  const num = (key: string) => {
    const value = current[key];
    return typeof value === "number" ? Math.round(value * 10) / 10 : null;
  };

  const pollutants: Pollutants = {
    aqi: num("european_aqi"),
    pm25: num("pm2_5"),
    pm10: num("pm10"),
    carbonMonoxide: num("carbon_monoxide"),
    nitrogenDioxide: num("nitrogen_dioxide"),
    ozone: num("ozone"),
    sulphurDioxide: num("sulphur_dioxide"),
    dust: num("dust"),
  };

  const grains = [
    { name: "Alder", value: num("alder_pollen") },
    { name: "Birch", value: num("birch_pollen") },
    { name: "Grass", value: num("grass_pollen") },
    { name: "Mugwort", value: num("mugwort_pollen") },
    { name: "Olive", value: num("olive_pollen") },
    { name: "Ragweed", value: num("ragweed_pollen") },
  ].filter((item): item is { name: string; value: number } => item.value !== null);

  const peak = grains.reduce((max, item) => Math.max(max, item.value), 0);
  const band = airBand(pollutants.aqi);

  return {
    pollutants,
    band,
    cropNote: CROP_NOTE[band],
    // Pollen is only modelled for some regions, so an empty list means "not covered here".
    pollen: grains.length > 0 ? { band: pollenBand(peak), peak, grains } : null,
    updatedAt: new Date().toISOString(),
  };
}

export const POLLEN_CROP_NOTE: Record<PollenBand, string> = {
  Low: "Little pollen in the air. Bees will still work, and cross pollination stays normal.",
  Moderate: "Normal pollen load. Good conditions for fruit set in flowering crops.",
  High: "Heavy pollen in the air. Great for pollination, but wipe greenhouse covers so light still reaches the plants.",
  "Very High":
    "Very heavy pollen. Field workers with allergy should wear a mask, and screens on nurseries need cleaning.",
};
