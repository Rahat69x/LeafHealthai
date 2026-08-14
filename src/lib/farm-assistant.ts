/** The AI farming assistant: best times for each job, in plain sentences. */

import type { WeatherReport } from "./weather";
import type { FarmHour, JobKey } from "./farming-hours";
import { bestWindow } from "./farming-hours";
import type { Crop } from "./crops";
import type { SoilReport } from "./soil-moisture";

export interface AssistantTip {
  id: string;
  job: string;
  window: string;
  text: string;
  tone: "good" | "watch" | "bad";
}

function windowText(hours: FarmHour[], job: JobKey): { window: string; ok: boolean } {
  const best = bestWindow(hours, job);
  if (!best) return { window: "No good window in the next 24 hours", ok: false };
  const endIndex = hours.indexOf(best.start) + best.length - 1;
  const end = hours[endIndex] ?? best.start;
  return { window: `${best.start.day} ${best.start.clock} – ${end.clock}`, ok: true };
}

export function buildAssistantTips(
  report: WeatherReport,
  hours: FarmHour[],
  crop: Crop,
  soil: SoilReport | null,
): AssistantTip[] {
  const tips: AssistantTip[] = [];

  const spray = windowText(hours, "spraying");
  tips.push({
    id: "spray",
    job: "Best time to spray",
    window: spray.window,
    tone: spray.ok ? "good" : "bad",
    text: spray.ok
      ? `Wind and rain are both low in this window, so the spray will stay on the ${crop.name.toLowerCase()} leaves.`
      : "Rain or wind spoils every hour of the next day. Wait and check again tomorrow morning.",
  });

  const irrigation = windowText(hours, "irrigation");
  const skipWater = soil && (soil.band === "Wet" || soil.band === "Very Wet");
  tips.push({
    id: "irrigation",
    job: "Best time to irrigate",
    window: skipWater ? "Not needed today" : irrigation.window,
    tone: skipWater ? "watch" : irrigation.ok ? "good" : "bad",
    text: skipWater
      ? `The soil is already ${soil?.band.toLowerCase()}. Save the water and the fuel, and open the drains instead.`
      : irrigation.ok
        ? "Cool hours with no rain: water now and less will be lost to the sun."
        : "Rain is expected, so hold the pump until the field dries out.",
  });

  const harvest = windowText(hours, "harvest");
  tips.push({
    id: "harvest",
    job: "Best time to harvest",
    window: harvest.window,
    tone: harvest.ok ? "good" : "watch",
    text: harvest.ok
      ? "Dry air in this window means the crop will store well without mould."
      : "Damp air all day. If you must harvest, dry the produce under cover before storing.",
  });

  const fertiliseOk = hours.some((hour) => hour.rainChance >= 30 && hour.rainChance <= 60);
  const fertHour = hours.find((hour) => hour.rainChance >= 30 && hour.rainChance <= 60);
  tips.push({
    id: "fertiliser",
    job: "Best time to fertilise",
    window: fertiliseOk
      ? `${fertHour?.day} ${fertHour?.clock}`
      : windowText(hours, "fieldWork").window,
    tone: "good",
    text: fertiliseOk
      ? "A light shower after spreading washes the fertiliser into the soil instead of losing it to the air."
      : "Apply on moist soil and water lightly afterwards so nothing burns the roots.",
  });

  const field = windowText(hours, "fieldWork");
  tips.push({
    id: "field",
    job: "Best time for field work",
    window: field.window,
    tone: field.ok ? "good" : "watch",
    text: field.ok
      ? "Mild hours with low sun stress: good for weeding, pruning and staking."
      : "Heat, rain or wind makes work hard today. Keep to short shifts and drink water.",
  });

  tips.push({
    id: "prevent",
    job: "Disease prevention",
    window: `Risk level: ${report.level}`,
    tone: report.level === "Low" ? "good" : report.level === "Medium" ? "watch" : "bad",
    text:
      report.level === "Low"
        ? `Pressure is low for ${crop.name.toLowerCase()}. Keep to the weekly walk and remove any old leaves you find.`
        : `Watch for ${crop.watch.slice(0, 2).join(" and ").toLowerCase()}. Remove infected leaves, keep the canopy open, and spray preventively on the next dry morning.`,
  });

  return tips;
}
