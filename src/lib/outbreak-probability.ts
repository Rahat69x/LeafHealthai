/** Disease outbreak probability from live weather plus the coming week. */

import type { WeatherReport } from "./weather";
import type { Crop } from "./crops";

export type OutbreakBand = "Very Low" | "Low" | "Moderate" | "High" | "Critical";

export interface OutbreakFactor {
  label: string;
  weight: number;
  detail: string;
}

export interface OutbreakPrediction {
  probability: number;
  band: OutbreakBand;
  headline: string;
  factors: OutbreakFactor[];
  diseases: { name: string; chance: number }[];
  action: string;
}

function bandOf(probability: number): OutbreakBand {
  if (probability >= 80) return "Critical";
  if (probability >= 60) return "High";
  if (probability >= 40) return "Moderate";
  if (probability >= 20) return "Low";
  return "Very Low";
}

const ACTION: Record<OutbreakBand, string> = {
  "Very Low": "Keep to your normal weekly check. Nothing extra is needed today.",
  Low: "Walk the field twice this week and look at the lower, older leaves first.",
  Moderate:
    "Scout every two days, remove sick leaves and keep the canopy open so air moves through.",
  High: "Scout daily and apply a preventive spray on a dry, calm morning before symptoms spread.",
  Critical:
    "Treat this as an outbreak week: scout daily, remove infected plants, and spray preventively as soon as leaves are dry.",
};

/**
 * A transparent weighted model. Every point added is shown to the user, so the
 * number can be explained instead of being a black box.
 */
export function predictOutbreak(report: WeatherReport, crop?: Crop): OutbreakPrediction {
  const now = report.now;
  const next3 = report.forecast.slice(0, 3);
  const avgRainChance = next3.length
    ? Math.round(next3.reduce((sum, day) => sum + day.rainChance, 0) / next3.length)
    : now.rainChance;
  const factors: OutbreakFactor[] = [];
  let score = 0;

  const addFactor = (weight: number, label: string, detail: string) => {
    if (weight <= 0) return;
    score += weight;
    factors.push({ label, weight, detail });
  };

  // Humidity is the single strongest driver of leaf disease.
  if (now.humidity >= 90)
    addFactor(
      26,
      "Humidity " + now.humidity + "%",
      "Air is almost saturated, so spores germinate on the leaf surface.",
    );
  else if (now.humidity >= 80)
    addFactor(
      20,
      "Humidity " + now.humidity + "%",
      "Damp air keeps leaves wet long enough for infection.",
    );
  else if (now.humidity >= 70)
    addFactor(
      12,
      "Humidity " + now.humidity + "%",
      "Moderately damp air gives fungus a slow start.",
    );
  else addFactor(3, "Humidity " + now.humidity + "%", "Dry air slows most leaf fungus down.");

  if (now.temperature >= 20 && now.temperature <= 30)
    addFactor(
      18,
      "Temperature " + now.temperature + "°C",
      "This is the growth range most crop fungi prefer.",
    );
  else if (now.temperature >= 15 && now.temperature < 20)
    addFactor(
      10,
      "Temperature " + now.temperature + "°C",
      "Cool but still workable for mildew and rust.",
    );
  else
    addFactor(
      4,
      "Temperature " + now.temperature + "°C",
      "Outside the comfort range of most crop fungi.",
    );

  if (now.rainfall >= 20 || avgRainChance >= 70)
    addFactor(
      18,
      "Rain " + avgRainChance + "% over 3 days",
      "Repeated rain splashes soil borne spores up onto the leaves.",
    );
  else if (avgRainChance >= 40)
    addFactor(
      11,
      "Rain " + avgRainChance + "% over 3 days",
      "Showers will wet the canopy on and off.",
    );
  else
    addFactor(
      2,
      "Rain " + avgRainChance + "% over 3 days",
      "Mostly dry days ahead limit spore splash.",
    );

  if (now.wind < 5)
    addFactor(9, "Wind " + now.wind + " km/h", "Still air traps moisture inside the canopy.");
  else if (now.wind < 12)
    addFactor(5, "Wind " + now.wind + " km/h", "Light breeze only partly dries the leaves.");
  else addFactor(1, "Wind " + now.wind + " km/h", "Good airflow dries leaves and lowers risk.");

  if (now.cloudCover >= 80)
    addFactor(
      8,
      "Cloud cover " + now.cloudCover + "%",
      "Thick cloud stops the sun from drying morning dew.",
    );
  else if (now.cloudCover >= 50)
    addFactor(
      4,
      "Cloud cover " + now.cloudCover + "%",
      "Part cloud slows leaf drying in the morning.",
    );

  if (now.leafWetnessHours >= 10)
    addFactor(
      14,
      "Leaf wetness " + now.leafWetnessHours + " h",
      "Ten or more damp hours is the classic infection window.",
    );
  else if (now.leafWetnessHours >= 6)
    addFactor(
      8,
      "Leaf wetness " + now.leafWetnessHours + " h",
      "Half a day of damp leaves is enough for some diseases.",
    );

  const wetDays = report.forecast.filter((day) => day.rainChance >= 50).length;
  if (wetDays >= 4)
    addFactor(
      7,
      wetDays + " wet days ahead",
      "A long wet spell keeps pressure on the crop all week.",
    );
  else if (wetDays >= 2)
    addFactor(4, wetDays + " wet days ahead", "A couple of wet days will keep the canopy damp.");

  const probability = Math.max(2, Math.min(97, Math.round(score)));
  const band = bandOf(probability);

  const names = crop?.watch ?? ["Leaf spot", "Blight", "Powdery mildew"];
  const diseases = names.slice(0, 3).map((name, index) => ({
    name,
    chance: Math.max(3, Math.round(probability * (1 - index * 0.18))),
  }));

  const headline = crop
    ? `${probability}% chance of a disease outbreak in ${crop.name.toLowerCase()} around ${report.place} in the next 3 days.`
    : `${probability}% chance of a disease outbreak around ${report.place} in the next 3 days.`;

  return { probability, band, headline, factors, diseases, action: ACTION[band] };
}
