/** Turns the hourly forecast into a work plan: what job suits each hour. */

import type { HourPoint } from "./hourly-weather";
import { clockLabel, dayLabel } from "./hourly-weather";

export type Fitness = "Good" | "Fair" | "Poor";

export interface FarmHour {
  time: string;
  clock: string;
  day: string;
  temperature: number;
  humidity: number;
  rainChance: number;
  rain: number;
  wind: number;
  summary: string;
  spraying: Fitness;
  irrigation: Fitness;
  harvest: Fitness;
  fieldWork: Fitness;
}

function summarise(hour: HourPoint): string {
  if (hour.rain >= 2) return "Heavy rain";
  if (hour.rain > 0 || hour.rainChance >= 60) return "Showers likely";
  if (hour.cloudCover >= 80) return "Cloudy";
  if (hour.cloudCover >= 40) return "Part cloud";
  if (hour.uvIndex >= 7) return "Strong sun";
  return "Clear";
}

function sprayFitness(hour: HourPoint, rainAfter: number): Fitness {
  if (hour.rain > 0 || hour.rainChance >= 50 || rainAfter >= 40) return "Poor";
  if (hour.wind >= 18 || hour.temperature >= 34) return "Poor";
  if (hour.wind >= 12 || hour.rainChance >= 30 || hour.uvIndex >= 8) return "Fair";
  return "Good";
}

function irrigationFitness(hour: HourPoint, rainAfter: number): Fitness {
  if (hour.rain > 0 || rainAfter >= 60) return "Poor";
  const hourOfDay = new Date(hour.time).getHours();
  const cool = hourOfDay <= 9 || hourOfDay >= 16;
  if (cool && hour.temperature < 34) return "Good";
  if (hour.temperature >= 35) return "Poor";
  return "Fair";
}

function harvestFitness(hour: HourPoint): Fitness {
  if (hour.rain > 0 || hour.rainChance >= 40) return "Poor";
  if (hour.humidity >= 85) return "Fair";
  if (hour.humidity <= 70 && hour.rainChance < 20) return "Good";
  return "Fair";
}

function fieldFitness(hour: HourPoint): Fitness {
  if (hour.rain >= 1 || hour.wind >= 30) return "Poor";
  if (hour.temperature >= 36 || hour.uvIndex >= 9) return "Fair";
  if (hour.rainChance >= 60) return "Fair";
  return "Good";
}

export function buildFarmHours(hours: HourPoint[]): FarmHour[] {
  return hours.slice(0, 24).map((hour, index) => {
    // Spraying and watering care about what happens right after, not just now.
    const next = hours.slice(index + 1, index + 4);
    const rainAfter = next.reduce((max, item) => Math.max(max, item.rainChance), 0);
    return {
      time: hour.time,
      clock: clockLabel(hour.time),
      day: dayLabel(hour.time),
      temperature: hour.temperature,
      humidity: hour.humidity,
      rainChance: hour.rainChance,
      rain: hour.rain,
      wind: hour.wind,
      summary: summarise(hour),
      spraying: sprayFitness(hour, rainAfter),
      irrigation: irrigationFitness(hour, rainAfter),
      harvest: harvestFitness(hour),
      fieldWork: fieldFitness(hour),
    };
  });
}

export type JobKey = "spraying" | "irrigation" | "harvest" | "fieldWork";

export const JOB_LABEL: Record<JobKey, string> = {
  spraying: "Spraying",
  irrigation: "Irrigation",
  harvest: "Harvest",
  fieldWork: "Field work",
};

/** Best continuous window for one job, used by the farming assistant. */
export function bestWindow(
  hours: FarmHour[],
  job: JobKey,
): { start: FarmHour; length: number } | null {
  let best: { start: FarmHour; length: number } | null = null;
  let index = 0;
  while (index < hours.length) {
    if (hours[index]![job] !== "Good") {
      index += 1;
      continue;
    }
    let end = index;
    while (end + 1 < hours.length && hours[end + 1]![job] === "Good") end += 1;
    const length = end - index + 1;
    if (!best || length > best.length) best = { start: hours[index]!, length };
    index = end + 1;
  }
  return best;
}
