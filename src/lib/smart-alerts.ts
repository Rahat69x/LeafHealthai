/** Smart weather alerts: what is coming, when, and what to do about it. */

import type { WeatherReport } from "./weather";
import type { HourPoint } from "./hourly-weather";
import { clockLabel, dayLabel } from "./hourly-weather";

export type AlertSeverity = "Advisory" | "Warning" | "Severe";

export interface SmartAlert {
  id: string;
  title: string;
  severity: AlertSeverity;
  when: string;
  detail: string;
  action: string;
}

const RANK: Record<AlertSeverity, number> = { Severe: 0, Warning: 1, Advisory: 2 };

function whenLabel(hour: HourPoint | undefined) {
  if (!hour) return "Today";
  return `${dayLabel(hour.time)} around ${clockLabel(hour.time)}`;
}

export function buildSmartAlerts(report: WeatherReport, hours: HourPoint[]): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const next24 = hours.slice(0, 24);
  const rain24 = next24.reduce((sum, hour) => sum + hour.rain, 0);
  const heaviest = [...next24].sort((a, b) => b.rain - a.rain)[0];
  const windiest = [...next24].sort((a, b) => b.windGust - a.windGust)[0];
  const hottest = [...next24].sort((a, b) => b.temperature - a.temperature)[0];
  const coldest = [...next24].sort((a, b) => a.temperature - b.temperature)[0];
  const uvPeak = [...next24].sort((a, b) => b.uvIndex - a.uvIndex)[0];

  if (rain24 >= 50 || (heaviest?.rain ?? 0) >= 15) {
    alerts.push({
      id: "heavy-rain",
      title: "Heavy rain",
      severity: rain24 >= 100 ? "Severe" : "Warning",
      when: whenLabel(heaviest),
      detail: `About ${Math.round(rain24)} mm of rain is expected in the next 24 hours.`,
      action: "Clear the drains, hold off on spraying and fertiliser, and stake young plants.",
    });
  } else if (rain24 >= 20) {
    alerts.push({
      id: "rain",
      title: "Steady rain",
      severity: "Advisory",
      when: whenLabel(heaviest),
      detail: `Around ${Math.round(rain24)} mm of rain is on the way.`,
      action: "Spray only after the rain passes and the leaves have dried.",
    });
  }

  // Thunder in Open-Meteo shows up as heavy rain with strong gusts on the same hour.
  const stormHour = next24.find((hour) => hour.rain >= 5 && hour.windGust >= 45);
  if (stormHour) {
    alerts.push({
      id: "thunderstorm",
      title: "Thunderstorm risk",
      severity: "Severe",
      when: whenLabel(stormHour),
      detail: "Heavy rain with strong gusts is likely, which usually means lightning.",
      action:
        "Keep everyone out of open fields and away from trees and metal frames during the storm.",
    });
  }

  if (rain24 >= 80 && report.now.rainfall >= 20) {
    alerts.push({
      id: "flood",
      title: "Flood risk",
      severity: "Severe",
      when: "Next 24 hours",
      detail: "The ground is already soaked and more heavy rain is coming.",
      action:
        "Open every drain now, move stored grain and inputs to higher ground, and keep livestock out of low fields.",
    });
  }

  if ((windiest?.windGust ?? 0) >= 62) {
    alerts.push({
      id: "cyclone",
      title: "Cyclone force wind",
      severity: "Severe",
      when: whenLabel(windiest),
      detail: `Gusts near ${windiest?.windGust} km/h are forecast.`,
      action:
        "Harvest what is ready, tie down shade nets and covers, and secure the seed and fertiliser store.",
    });
  } else if ((windiest?.windGust ?? 0) >= 40) {
    alerts.push({
      id: "wind",
      title: "Strong wind",
      severity: "Warning",
      when: whenLabel(windiest),
      detail: `Gusts up to ${windiest?.windGust} km/h are forecast.`,
      action: "Do not spray. Support tall crops such as banana and maize.",
    });
  }

  if ((hottest?.temperature ?? 0) >= 38) {
    alerts.push({
      id: "heat",
      title: "Heat wave",
      severity: (hottest?.temperature ?? 0) >= 41 ? "Severe" : "Warning",
      when: whenLabel(hottest),
      detail: `Temperature is expected to reach ${hottest?.temperature}°C.`,
      action: "Irrigate before sunrise, mulch the beds, and keep field work to the cool hours.",
    });
  }

  if ((coldest?.temperature ?? 99) <= 10) {
    alerts.push({
      id: "cold",
      title: "Cold wave",
      severity: (coldest?.temperature ?? 99) <= 6 ? "Severe" : "Warning",
      when: whenLabel(coldest),
      detail: `Temperature may drop to ${coldest?.temperature}°C.`,
      action:
        "Cover seedbeds at night, water the field lightly in the evening, and delay transplanting.",
    });
  }

  const fogHour = next24.find(
    (hour) => hour.humidity >= 95 && hour.temperature - hour.dewPoint <= 1 && hour.wind < 8,
  );
  if (fogHour) {
    alerts.push({
      id: "fog",
      title: "Dense fog",
      severity: "Advisory",
      when: whenLabel(fogHour),
      detail: "Air will be saturated with almost no wind, so thick fog is likely.",
      action:
        "Fog keeps leaves wet for hours and helps blight. Scout in the morning and delay spraying until leaves dry.",
    });
  }

  const humidHours = next24.filter((hour) => hour.humidity >= 90).length;
  if (humidHours >= 8) {
    alerts.push({
      id: "humidity",
      title: "Very high humidity",
      severity: "Warning",
      when: `About ${humidHours} hours in the next day`,
      detail: "Long damp spells let fungus settle on the leaves.",
      action:
        "Thin the canopy, water at the roots only, and plan a preventive spray on the next dry morning.",
    });
  }

  if ((uvPeak?.uvIndex ?? 0) >= 9) {
    alerts.push({
      id: "uv",
      title: "Extreme UV",
      severity: "Advisory",
      when: whenLabel(uvPeak),
      detail: `UV index reaches ${uvPeak?.uvIndex} around midday.`,
      action: "Avoid field work between 11am and 3pm, and shade young seedlings and nursery trays.",
    });
  }

  return alerts.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
}
