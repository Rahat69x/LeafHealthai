/**
 * Agricultural intelligence engine.
 *
 * This is NOT a diagnosis engine. Image analysis stays the only source of a
 * confirmed disease. This module turns weather, season, region and past scans
 * into an *environmental risk estimate* plus practical prevention advice.
 */

import type { AnalysisResult } from "./demo-analysis";
import type { DayRisk, RiskLevel, Season, WeatherReport } from "./weather";
import { SEASON_NOTES } from "./weather";

export type Priority = "High" | "Medium" | "Low";

export interface DiseaseRisk {
  disease: string;
  score: number;
  level: RiskLevel;
  because: string[];
}

export interface Recommendation {
  action: string;
  reason: string;
  benefit: string;
  priority: Priority;
}

export interface DayOutlook {
  date: string;
  label: string;
  level: RiskLevel;
  score: number;
  percent: number;
  why: string;
  watch: string[];
}

export interface FutureWatch {
  disease: string;
  window: string;
  why: string;
  level: RiskLevel;
}

export interface Assessment {
  /** Overall environmental risk, not a diagnosis. */
  level: RiskLevel;
  /** 0-100, easier to show than raw points. */
  percent: number;
  /** How trustworthy this estimate is with the data we have. */
  dataQuality: "good" | "limited" | "insufficient";
  dataNote: string;
  /** Plain language summary for farmers. */
  summary: string;
  /** "Why is the risk high?" bullet points. */
  drivers: string[];
  diseases: DiseaseRisk[];
  forecast: DayOutlook[];
  recommendations: Recommendation[];
  futureWatch: FutureWatch[];
  /** Confirmed finding from image analysis, if the user has scanned a leaf. */
  confirmed: { plant: string; disease: string; confidence: number; date: string } | null;
  season: Season;
  place: string;
}

/* ------------------------------------------------------------------ */
/* Weather -> disease rule engine                                      */
/* ------------------------------------------------------------------ */

interface RuleInput {
  temperature: number;
  humidity: number;
  rainChance: number;
  rainfall: number;
  wind: number;
  uvIndex: number;
  cloudCover: number;
  /** Days in the next week with heavy rain. */
  wetDays: number;
  humidityTrend: number;
  tempTrend: number;
}

interface Rule {
  id: string;
  weight: number;
  diseases: string[];
  reason: string;
  test: (env: RuleInput) => boolean;
}

export const RULES: Rule[] = [
  {
    id: "humid-wet",
    weight: 4,
    diseases: ["Early Blight", "Late Blight", "Leaf Spot", "Powdery Mildew", "Downy Mildew"],
    reason:
      "Humidity is above 85% and rain is likely, so leaves stay wet long enough for fungus to grow.",
    test: (e) => e.humidity > 85 && e.rainChance > 60,
  },
  {
    id: "humid-only",
    weight: 2,
    diseases: ["Powdery Mildew", "Downy Mildew", "Leaf Spot"],
    reason: "The air is very damp, so water stays on the leaf surface for hours.",
    test: (e) => e.humidity > 85 && e.rainChance <= 60,
  },
  {
    id: "fungal-temperature",
    weight: 2,
    diseases: ["Early Blight", "Leaf Spot", "Downy Mildew"],
    reason:
      "The temperature is between 18°C and 30°C, the range most leaf fungus grows fastest in.",
    test: (e) => e.temperature >= 18 && e.temperature <= 30 && e.humidity >= 70,
  },
  {
    id: "heat-stress",
    weight: 3,
    diseases: ["Leaf Scorch", "Heat Stress", "Spider Mite Damage"],
    reason: "The temperature is above 35°C, which burns leaf edges and helps mites multiply.",
    test: (e) => e.temperature > 35,
  },
  {
    id: "multi-day-rain",
    weight: 4,
    diseases: ["Anthracnose", "Bacterial Leaf Spot", "Root Rot"],
    reason:
      "Heavy rain is expected on several days, so soil stays soaked and splashes bacteria onto leaves.",
    test: (e) => e.wetDays >= 2,
  },
  {
    id: "still-air",
    weight: 1,
    diseases: ["Powdery Mildew", "Downy Mildew"],
    reason: "The wind is very light, so damp air sits between the plants and does not dry out.",
    test: (e) => e.wind < 6 && e.humidity >= 70,
  },
  {
    id: "strong-wind",
    weight: 2,
    diseases: ["Bacterial Leaf Spot", "Leaf Rust"],
    reason:
      "Strong wind carries disease spores from field to field and makes small wounds on leaves.",
    test: (e) => e.wind >= 30,
  },
  {
    id: "rising-humidity",
    weight: 2,
    diseases: ["Late Blight", "Downy Mildew"],
    reason:
      "Humidity is rising over the coming days, so conditions are getting more disease friendly.",
    test: (e) => e.humidityTrend >= 8,
  },
  {
    id: "cloud-cover",
    weight: 1,
    diseases: ["Early Blight", "Leaf Spot"],
    reason: "Thick cloud keeps the sun off the leaves, so morning dew dries very slowly.",
    test: (e) => e.cloudCover >= 80 && e.humidity >= 70,
  },
  {
    id: "dry-air",
    weight: 2,
    diseases: ["Spider Mite Damage", "Leaf Scorch"],
    reason: "The air is dry with strong sun, which stresses plants and favours mites.",
    test: (e) => e.humidity < 45 && e.uvIndex >= 7,
  },
];

/* ------------------------------------------------------------------ */
/* Season and crop knowledge                                           */
/* ------------------------------------------------------------------ */

const CROP_SEASON_PROFILE: Record<string, Partial<Record<Season, string[]>>> = {
  Tomato: {
    Summer: ["Leaf Curl", "Spider Mite Damage"],
    Rainy: ["Late Blight", "Early Blight", "Bacterial Leaf Spot"],
    Autumn: ["Early Blight", "Leaf Mould"],
    Winter: ["Powdery Mildew", "Leaf Mould"],
    Spring: ["Early Blight", "Leaf Curl"],
  },
  Potato: {
    Rainy: ["Late Blight", "Black Scurf"],
    Autumn: ["Early Blight", "Late Blight"],
    Winter: ["Late Blight"],
    Summer: ["Heat Stress"],
    Spring: ["Early Blight"],
  },
  Rice: {
    Rainy: ["Blast", "Bacterial Leaf Blight", "Sheath Blight"],
    Autumn: ["Brown Spot", "Sheath Blight"],
    Winter: ["Brown Spot"],
    Summer: ["Heat Stress"],
    Spring: ["Blast"],
  },
  Maize: {
    Rainy: ["Leaf Blight", "Rust"],
    Autumn: ["Grey Leaf Spot"],
    Summer: ["Heat Stress"],
    Winter: ["Rust"],
    Spring: ["Leaf Blight"],
  },
  Wheat: {
    Winter: ["Leaf Rust", "Powdery Mildew"],
    Spring: ["Leaf Rust", "Yellow Rust"],
    Rainy: ["Leaf Blight"],
    Autumn: ["Powdery Mildew"],
    Summer: ["Heat Stress"],
  },
  Mango: {
    Rainy: ["Anthracnose", "Powdery Mildew"],
    Spring: ["Powdery Mildew", "Hopper damage"],
    Summer: ["Leaf Scorch"],
    Autumn: ["Anthracnose"],
    Winter: ["Sooty Mould"],
  },
  Chilli: {
    Rainy: ["Anthracnose", "Bacterial Leaf Spot"],
    Summer: ["Leaf Curl", "Spider Mite Damage"],
    Winter: ["Powdery Mildew"],
    Autumn: ["Leaf Spot"],
    Spring: ["Leaf Curl"],
  },
};

export function seasonalProfile(season: Season, plant?: string): string[] {
  const crop = plant ? CROP_SEASON_PROFILE[normalisePlant(plant)] : undefined;
  return crop?.[season] ?? SEASON_NOTES[season].diseases;
}

function normalisePlant(plant: string) {
  const key = plant.trim().toLowerCase();
  const match = Object.keys(CROP_SEASON_PROFILE).find((name) => name.toLowerCase() === key);
  return match ?? plant;
}

/* ------------------------------------------------------------------ */
/* Assessment                                                          */
/* ------------------------------------------------------------------ */

function levelFromPercent(percent: number): RiskLevel {
  if (percent >= 80) return "Very High";
  if (percent >= 60) return "High";
  if (percent >= 35) return "Medium";
  return "Low";
}

function trend(values: number[]) {
  if (values.length < 4) return 0;
  const first = values.slice(0, 2);
  const last = values.slice(-2);
  const avg = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / list.length;
  return Math.round(avg(last) - avg(first));
}

function dayEnv(day: DayRisk, base: RuleInput): RuleInput {
  return {
    ...base,
    temperature: Math.round((day.tempMax + day.tempMin) / 2),
    humidity: day.humidity,
    rainChance: day.rainChance,
    rainfall: day.rainfall,
    wind: day.wind,
    uvIndex: day.uvIndex,
  };
}

function scoreEnv(env: RuleInput) {
  const fired = RULES.filter((rule) => rule.test(env));
  const points = fired.reduce((sum, rule) => sum + rule.weight, 0);
  const percent = Math.min(100, Math.round((points / 12) * 100));
  return { fired, points, percent };
}

export function assess(input: {
  report: WeatherReport;
  season: Season;
  plant?: string | undefined;
  history?: AnalysisResult[] | undefined;
  place?: string | undefined;
}): Assessment {
  const { report, season } = input;
  const history = input.history ?? [];
  const latest = history[0];
  const plant = input.plant ?? latest?.plant;

  const humidityTrend = trend(report.forecast.map((day) => day.humidity));
  const tempTrend = trend(
    report.forecast.map((day) => Math.round((day.tempMax + day.tempMin) / 2)),
  );
  const wetDays = report.forecast.filter(
    (day) => day.rainChance >= 60 || day.rainfall >= 10,
  ).length;

  const env: RuleInput = {
    temperature: report.now.temperature,
    humidity: report.now.humidity,
    rainChance: report.now.rainChance,
    rainfall: report.now.rainfall,
    wind: report.now.wind,
    uvIndex: report.now.uvIndex,
    cloudCover: report.now.cloudCover,
    wetDays,
    humidityTrend,
    tempTrend,
  };

  const { fired, percent } = scoreEnv(env);
  const seasonList = seasonalProfile(season, plant);

  /* Disease level risk: rule hits + season profile + past scans on this plant. */
  const bucket = new Map<string, { score: number; because: string[] }>();
  const bump = (disease: string, score: number, reason: string) => {
    const current = bucket.get(disease) ?? { score: 0, because: [] };
    current.score += score;
    if (!current.because.includes(reason)) current.because.push(reason);
    bucket.set(disease, current);
  };

  fired.forEach((rule) =>
    rule.diseases.forEach((disease) => bump(disease, rule.weight, rule.reason)),
  );
  seasonList.forEach((disease) =>
    bump(
      disease,
      2,
      `The ${season.toLowerCase()} season usually brings this problem to ${plant ?? "local crops"}.`,
    ),
  );
  history
    .filter((entry) => !plant || entry.plant === plant)
    .slice(0, 6)
    .forEach((entry) => {
      if (entry.disease && !/healthy/i.test(entry.disease))
        bump(
          entry.disease,
          3,
          "You already found this disease in an earlier leaf scan at this location.",
        );
    });

  const diseases: DiseaseRisk[] = [...bucket.entries()]
    .map(([disease, value]) => {
      const dScore = Math.min(100, Math.round((value.score / 9) * 100));
      return {
        disease,
        score: dScore,
        level: levelFromPercent(dScore),
        because: value.because.slice(0, 3),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const drivers = [
    `Humidity is ${report.now.humidity}%${report.now.humidity >= 85 ? ", high enough to keep leaves wet for hours" : ""}.`,
    `Rain chance today is ${report.now.rainChance}%${wetDays ? `, and ${wetDays} of the next 7 days look wet` : ""}.`,
    `Temperature is ${report.now.temperature}°C${report.now.temperature >= 18 && report.now.temperature <= 30 ? ", ideal for fungal growth" : ""}.`,
    ...fired.slice(0, 3).map((rule) => rule.reason),
    `Current season is ${season}: ${SEASON_NOTES[season].text}`,
  ];

  const forecast: DayOutlook[] = report.forecast.map((day) => {
    const dayScore = scoreEnv(dayEnv(day, env));
    const watch = [...new Set(dayScore.fired.flatMap((rule) => rule.diseases))].slice(0, 3);
    const why =
      dayScore.percent >= 60
        ? `${day.humidity}% humidity with ${day.rainChance}% rain chance keeps leaves wet, so disease can spread fast.`
        : dayScore.percent >= 35
          ? `${day.humidity}% humidity and ${day.rainChance}% rain chance make a moderate chance of leaf infection.`
          : `Drier air (${day.humidity}% humidity) and only ${day.rainChance}% rain chance keep the risk low.`;
    return {
      date: day.date,
      label: day.label,
      score: dayScore.points,
      percent: dayScore.percent,
      level: levelFromPercent(dayScore.percent),
      why,
      watch,
    };
  });

  const level = levelFromPercent(percent);
  const recommendations = buildRecommendations({
    report,
    level,
    env,
    season,
    plant,
    top: diseases[0],
  });

  const futureWatch: FutureWatch[] = forecast
    .slice(1)
    .filter((day) => day.percent >= 55 && day.watch.length)
    .slice(0, 3)
    .map((day) => ({
      disease: day.watch[0] ?? "Leaf fungus",
      window: day.label,
      why: day.why,
      level: day.level,
    }));

  const dataQuality: Assessment["dataQuality"] =
    report.forecast.length >= 5 ? "good" : report.forecast.length >= 2 ? "limited" : "insufficient";
  const dataNote =
    dataQuality === "good"
      ? "Based on live weather plus a 7 day forecast for your location."
      : dataQuality === "limited"
        ? "Only part of the forecast is available, so treat this risk estimate as rough."
        : "There is not enough weather data to estimate disease risk accurately right now.";

  const summary = plainSummary(level, report, plant, diseases[0]);

  const confirmed =
    latest && latest.disease
      ? {
          plant: latest.plant,
          disease: latest.disease,
          confidence: Math.round(latest.confidence),
          date: latest.date,
        }
      : null;

  return {
    level,
    percent,
    dataQuality,
    dataNote,
    summary,
    drivers: drivers.slice(0, 6),
    diseases,
    forecast,
    recommendations,
    futureWatch,
    confirmed,
    season,
    place: input.place ?? report.place,
  };
}

function plainSummary(level: RiskLevel, report: WeatherReport, plant?: string, top?: DiseaseRisk) {
  const who = plant ? `your ${plant.toLowerCase()} plants` : "your plants";
  if (level === "Very High")
    return `Today's weather is very risky for ${who}. ${top ? `${top.disease} can spread quickly.` : ""} Check every plant today, do not water the leaves, and remove any spotted leaves.`;
  if (level === "High")
    return `Today's weather creates a high risk of leaf disease for ${who}. Check your plants carefully and avoid watering the leaves.`;
  if (level === "Medium")
    return `The weather today is a little risky for ${who}. Look at the lower leaves this week and keep the soil, not the leaves, watered.`;
  return `The weather is safe for ${who} today. Keep your normal care and check the plants once this week.`;
}

function buildRecommendations(input: {
  report: WeatherReport;
  level: RiskLevel;
  env: RuleInput;
  season: Season;
  plant?: string | undefined;
  top?: DiseaseRisk | undefined;
}): Recommendation[] {
  const { report, level, env, plant, top } = input;
  const list: Recommendation[] = [];

  if (env.humidity >= 80 || level === "High" || level === "Very High")
    list.push({
      action: "Inspect the lower leaves tomorrow morning.",
      reason: `Humidity is ${env.humidity}% and ${top ? `${top.disease} risk is ${top.level.toLowerCase()}` : "fungal risk is raised"}. Early spots always start on the shaded lower leaves.`,
      benefit:
        "Catching the first spots lets you remove them before the disease reaches the whole plant.",
      priority: "High",
    });

  if (env.rainChance >= 60)
    list.push({
      action: "Delay pesticide or fungicide spraying.",
      reason: `There is a ${env.rainChance}% chance of rain, and rain washes the spray off the leaves within an hour.`,
      benefit: "Saves the cost of the chemical and keeps the treatment effective.",
      priority: "High",
    });

  list.push({
    action:
      env.temperature >= 32
        ? "Water at the root between 5 am and 8 am only."
        : "Water the soil, not the leaves, and never in the evening.",
    reason:
      env.temperature >= 32
        ? "Above 32°C, midday watering evaporates fast and shocks the roots."
        : "Wet leaves overnight are the main way leaf fungus enters the plant.",
    benefit: "Plants get the water they need while the leaves stay dry.",
    priority: level === "Low" ? "Low" : "Medium",
  });

  if (env.wind < 6)
    list.push({
      action: "Improve air movement: thin crowded leaves and widen plant spacing.",
      reason: `Wind speed is only ${env.wind} km/h, so damp air stays trapped between the plants.`,
      benefit: "Faster drying leaves cut fungal infection sharply.",
      priority: "Medium",
    });

  if (env.wetDays >= 2)
    list.push({
      action: "Clear drains and make raised beds before the rain arrives.",
      reason: `${env.wetDays} wet days are expected this week, and standing water leads to root rot and bacterial spot.`,
      benefit: "Well drained soil protects the roots and stops soil splash onto the leaves.",
      priority: "High",
    });

  if (env.temperature > 35)
    list.push({
      action: "Give young plants shade in the afternoon and mulch the soil.",
      reason: `The temperature is ${env.temperature}°C, hot enough to scorch leaf edges and encourage spider mites.`,
      benefit: "Cooler soil keeps the plant growing instead of losing leaves.",
      priority: "Medium",
    });

  if (level === "Low")
    list.push({
      action: "Keep your normal routine and record one scan this week.",
      reason: "Conditions are dry and disease pressure is low right now.",
      benefit: "A weekly record shows you early if anything changes.",
      priority: "Low",
    });

  if (plant)
    list.push({
      action: `Mulch around your ${plant.toLowerCase()} with straw or dry leaves.`,
      reason: "Rain splash from bare soil carries fungus spores up onto the lowest leaves.",
      benefit: "Cuts soil borne infection and keeps soil moisture steady.",
      priority: "Medium",
    });

  const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
  return list.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 6);
}
