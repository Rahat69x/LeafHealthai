import type { HourPoint } from "./hourly-weather";
import type { WeatherReport } from "./weather";

/** Tells the farmer whether to water today, and why. */

export interface IrrigationAdvice {
  action: "water" | "water-morning" | "reduce" | "skip";
  headline: string;
  adjustPercent: number;
  reasons: string[];
  bestTime: string;
  rainNext48: number;
}

export function irrigationAdvice(report: WeatherReport, hours: HourPoint[]): IrrigationAdvice {
  const next48 = hours.slice(0, 48);
  const rainNext48 = Math.round(next48.reduce((sum, hour) => sum + hour.rain, 0) * 10) / 10;
  const rainNext24 =
    Math.round(next48.slice(0, 24).reduce((sum, hour) => sum + hour.rain, 0) * 10) / 10;
  const rainChance24 = Math.max(0, ...next48.slice(0, 24).map((hour) => hour.rainChance));
  const today = report.forecast[0];
  const rainToday = report.now.rainfall;
  const heat = today?.tempMax ?? report.now.temperature;
  const humidity = report.now.humidity;
  const wind = report.now.wind;

  const reasons: string[] = [];
  const bestTime = "Between 5:30 AM and 8:00 AM, before the sun gets strong.";

  if (rainToday >= 10) {
    reasons.push(`${rainToday} mm of rain has already fallen today, so the soil is wet.`);
    return {
      action: "skip",
      headline: "Skip watering today.",
      adjustPercent: -100,
      reasons,
      bestTime,
      rainNext48,
    };
  }

  if (rainNext24 >= 8 || (rainChance24 >= 70 && rainNext24 >= 4)) {
    reasons.push(`About ${rainNext24} mm of rain is expected in the next 24 hours.`);
    reasons.push("Watering now would waste water and could drown the roots.");
    return {
      action: "skip",
      headline: "Skip watering today. Rain is coming.",
      adjustPercent: -100,
      reasons,
      bestTime,
      rainNext48,
    };
  }

  if (rainNext48 >= 5) {
    reasons.push(`About ${rainNext48} mm of rain is expected in the next two days.`);
    reasons.push("Give less water now and let the rain finish the job.");
    return {
      action: "reduce",
      headline: "Water about 30% less today.",
      adjustPercent: -30,
      reasons,
      bestTime,
      rainNext48,
    };
  }

  if (humidity >= 80 && heat <= 28) {
    reasons.push(
      `Humidity is ${humidity}% and the day stays around ${heat}C, so the soil dries slowly.`,
    );
    reasons.push("Too much water in damp air also raises the risk of fungus.");
    return {
      action: "reduce",
      headline: "Water about 30% less today.",
      adjustPercent: -30,
      reasons,
      bestTime,
      rainNext48,
    };
  }

  if (heat >= 33 || (humidity <= 45 && wind >= 12)) {
    if (heat >= 33)
      reasons.push(`It will reach about ${heat}C today, so plants will lose water fast.`);
    if (humidity <= 45) reasons.push(`Air is dry at ${humidity}% humidity.`);
    if (wind >= 12) reasons.push(`Wind at ${wind} km/h dries the soil surface quickly.`);
    reasons.push("Water early so the roots drink before the heat, not the sun.");
    return {
      action: "water-morning",
      headline: "Water early tomorrow morning, and a little more than usual.",
      adjustPercent: 20,
      reasons,
      bestTime,
      rainNext48,
    };
  }

  reasons.push(`Only about ${rainNext48} mm of rain is expected in the next two days.`);
  reasons.push(`Temperature around ${heat}C with ${humidity}% humidity means normal water use.`);
  return {
    action: "water",
    headline: "Water today as usual.",
    adjustPercent: 0,
    reasons,
    bestTime,
    rainNext48,
  };
}
