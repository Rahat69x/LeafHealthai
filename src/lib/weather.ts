/** Free weather + air quality data from Open-Meteo. No key and no sign up needed. */

import { fetchJson } from "./net";
import { moonPhase } from "./moon";

export interface Place {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export interface WeatherNow {
  temperature: number;
  feelsLike: number;
  humidity: number;
  rainChance: number;
  /** Rain already measured today, in mm. */
  rainfall: number;
  wind: number;
  windDirection: number;
  windName: string;
  windGust: number;
  pressure: number;
  cloudCover: number;
  uvIndex: number;
  /** Kilometres of clear sight. */
  visibility: number;
  dewPoint: number;
  /** Hours in the next day when leaves are likely to stay wet. */
  leafWetnessHours: number;
  moonName: string;
  moonIllumination: number;
  sunrise: string;
  sunset: string;
  airQuality: number | null;
  airQualityLabel: string;
}

export interface DayRisk {
  date: string;
  label: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainChance: number;
  rainfall: number;
  uvIndex: number;
  wind: number;
  level: RiskLevel;
  score: number;
}

export interface WeatherAlert {
  title: string;
  detail: string;
  tone: "warn" | "danger" | "info";
}

export interface WeatherReport {
  place: string;
  latitude: number;
  longitude: number;
  now: WeatherNow;
  level: RiskLevel;
  score: number;
  reason: string;
  advice: string[];
  forecast: DayRisk[];
  alerts: WeatherAlert[];
  updatedAt: string;
}

export type Season = "Summer" | "Rainy" | "Autumn" | "Winter" | "Spring";

export async function findPlace(query: string): Promise<Place | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("weather lookup failed");
  const data = (await response.json()) as {
    results?: {
      name: string;
      country?: string;
      admin1?: string;
      latitude: number;
      longitude: number;
    }[];
  };
  const first = data.results?.[0];
  if (!first) return null;
  return {
    name: first.name,
    country: first.country ?? "",
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

function riskScore(input: {
  humidity: number;
  rainChance: number;
  temperature: number;
  wind: number;
  /** Hours the leaves are likely to stay wet. Long wetness is what starts infection. */
  leafWetnessHours?: number;
  cloudCover?: number;
}) {
  let points = 0;
  if (input.humidity >= 85) points += 3;
  else if (input.humidity >= 70) points += 2;
  else if (input.humidity >= 60) points += 1;
  if (input.rainChance >= 70) points += 2;
  else if (input.rainChance >= 40) points += 1;
  if (input.temperature >= 18 && input.temperature <= 30) points += 2;
  if (input.wind < 6) points += 1;
  const wet = input.leafWetnessHours ?? 0;
  if (wet >= 10) points += 2;
  else if (wet >= 6) points += 1;
  // Overcast days dry the leaves slowly.
  if ((input.cloudCover ?? 0) >= 80) points += 1;
  return points;
}

export function levelFromScore(score: number): RiskLevel {
  return score >= 10 ? "Very High" : score >= 7 ? "High" : score >= 4 ? "Medium" : "Low";
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function windName(degrees: number) {
  return COMPASS[Math.round(degrees / 45) % 8] ?? "N";
}

function aqiLabel(value: number | null) {
  if (value === null) return "Not available";
  if (value <= 20) return "Very good";
  if (value <= 40) return "Good";
  if (value <= 60) return "Fair";
  if (value <= 80) return "Poor";
  return "Very poor";
}

export function seasonOf(date = new Date(), latitude = 23.8): Season {
  const month = date.getMonth() + 1;
  if (latitude >= 5 && latitude <= 35) {
    // Tropical / South Asian season names.
    if (month >= 3 && month <= 5) return "Summer";
    if (month >= 6 && month <= 9) return "Rainy";
    if (month === 10 || month === 11) return "Autumn";
    return "Winter";
  }
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Autumn";
  return "Winter";
}

export const SEASON_NOTES: Record<Season, { text: string; diseases: string[] }> = {
  Summer: {
    text: "In summer the heat and dry wind stress plants. Leaf spot and mites are more common.",
    diseases: ["Leaf Spot", "Powdery Mildew", "Spider Mites"],
  },
  Rainy: {
    text: "During the rainy season, fungal diseases are more common. Check your plants regularly.",
    diseases: ["Late Blight", "Early Blight", "Leaf Rust", "Bacterial Spot"],
  },
  Autumn: {
    text: "Warm days and cool wet nights bring dew. Fungus can start on the lower leaves.",
    diseases: ["Downy Mildew", "Leaf Rust", "Early Blight"],
  },
  Winter: {
    text: "Cool and damp mornings help mildew grow slowly. Growth is slower, so damage stays longer.",
    diseases: ["Powdery Mildew", "Downy Mildew"],
  },
  Spring: {
    text: "New soft leaves come out in spring. They catch disease and insects easily.",
    diseases: ["Leaf Rust", "Bacterial Spot", "Aphid damage"],
  },
};

function buildAlerts(now: WeatherNow, forecast: DayRisk[], weatherCode = 0): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const rainSoon = forecast.slice(0, 2).some((day) => day.rainChance >= 70);
  const heavyRain = forecast.slice(0, 2).some((day) => day.rainfall >= 40);
  const coldest = Math.min(...forecast.slice(0, 3).map((day) => day.tempMin));
  // Open-Meteo weather codes: 95-99 are thunderstorms.
  const thunder = weatherCode >= 95;

  if (heavyRain)
    alerts.push({
      title: "Heavy rainfall warning",
      detail:
        "Over 40 mm of rain is expected. Clear the drains and do not apply fertiliser before it passes.",
      tone: "danger",
    });
  if (rainSoon)
    alerts.push({
      title: "Heavy rain expected",
      detail:
        "Rain splashes soil onto leaves and spreads fungus. Do not spray today, it will wash away.",
      tone: "warn",
    });
  if (thunder || (now.wind >= 45 && now.rainChance >= 60))
    alerts.push({
      title: "Storm warning",
      detail: "A storm is likely. Stake tall plants, stop all field work and keep sprayers closed.",
      tone: "danger",
    });
  if (thunder)
    alerts.push({
      title: "Lightning risk",
      detail: "Thunder is forecast. Do not stand in an open field or near metal poles and pumps.",
      tone: "danger",
    });
  if (now.humidity >= 85)
    alerts.push({
      title: "High humidity today",
      detail: "Wet air keeps leaves damp for hours. This is the best weather for leaf fungus.",
      tone: "warn",
    });
  if (now.temperature >= 36)
    alerts.push({
      title: "Heat wave warning",
      detail:
        "Very hot air burns leaf edges. Water early in the morning and give shade to young plants.",
      tone: "danger",
    });
  if (coldest <= 2)
    alerts.push({
      title: "Frost warning",
      detail:
        "Temperature may fall near freezing at night. Cover seedlings and irrigate lightly before dusk.",
      tone: "danger",
    });
  else if (coldest <= 10)
    alerts.push({
      title: "Cold wave warning",
      detail:
        "Cold nights slow growth and invite mildew. Water in the morning only and cover young beds.",
      tone: "warn",
    });
  if (now.wind >= 30)
    alerts.push({
      title: "Strong wind warning",
      detail:
        "Strong wind breaks stems and carries disease spores to other plants. Tie tall plants.",
      tone: "danger",
    });

  if (now.uvIndex >= 8)
    alerts.push({
      title: "Very strong sun",
      detail: "Strong UV can burn wet leaves. Avoid spraying in the middle of the day.",
      tone: "info",
    });
  if (now.airQuality !== null && now.airQuality > 80)
    alerts.push({
      title: "Poor air quality",
      detail: "Dust settles on leaves and blocks light. Rinse leaves gently in the early morning.",
      tone: "info",
    });
  return alerts;
}

export function farmingTips(
  report: WeatherReport,
  season: Season,
  plant?: string | undefined,
): string[] {
  const tips: string[] = [];
  tips.push(
    report.now.temperature >= 32
      ? "Water your plants early in the morning, before 8 am."
      : "Water the soil, not the leaves, and avoid watering at night.",
  );
  if (report.level === "High") {
    tips.push("Remove infected leaves today and burn or bury them away from the field.");
    tips.push("Spray fungicide only if you already see spots, and spray when the leaves are dry.");
  } else if (report.level === "Medium") {
    tips.push("Check the lower leaves twice this week for new spots.");
  } else {
    tips.push("Risk is low. Keep your normal care and check the plants once this week.");
  }
  if (report.now.wind < 6)
    tips.push("Air is still today. Give plants more space so air can move between them.");
  if (report.now.rainChance >= 60)
    tips.push("Rain is coming. Delay spraying until the leaves stay dry for a few hours.");
  tips.push(SEASON_NOTES[season].text);
  if (plant)
    tips.push(
      `For ${plant}: keep the soil covered with straw so rain cannot splash onto the leaves.`,
    );
  return tips.slice(0, 6);
}

export function smartRecommendations(input: {
  report: WeatherReport;
  season: Season;
  plant?: string | undefined;
  disease?: string | undefined;
  area?: string | undefined;
}) {
  const { report, season, plant, disease, area } = input;
  const hot = report.now.temperature >= 32;
  return {
    watering: hot
      ? "Water between 5 am and 8 am. Give water at the root, never on the leaves."
      : "Water in the morning so leaves are dry before evening. Do not water at night.",
    spraying:
      report.now.rainChance >= 60
        ? "Do not spray today. Rain will wash it away. Wait for a dry morning."
        : report.now.wind >= 20
          ? "Wind is strong. Spray early morning when the wind is calm."
          : "Best spray time is early morning or late afternoon, when leaves are dry and the sun is low.",
    fertiliser:
      report.level === "High"
        ? "Avoid heavy nitrogen now. Soft new leaves catch disease fast. Use potash for stronger leaves."
        : "Use a balanced fertiliser every 2 to 3 weeks, and add compost to keep the soil healthy.",
    organic:
      disease && !/healthy/i.test(disease)
        ? "Neem oil spray every 7 days, plus baking soda and soap water on the spotted leaves."
        : "Neem oil once every 10 days works well as protection, even with no disease.",
    harvest:
      report.now.rainChance >= 60
        ? "Do not harvest in the rain. Wet crops rot quickly in storage."
        : "Harvest in the dry morning and keep the crop in a cool, airy place.",
    note: `Advice for ${plant ?? "your plants"}${area ? ` in ${area}` : ""} during the ${season.toLowerCase()} season.`,
  };
}

export async function getWeatherReport(place: Place): Promise<WeatherReport> {
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,cloud_cover,visibility,dew_point_2m,weather_code` +
    `&hourly=relative_humidity_2m,dew_point_2m,temperature_2m` +
    `&daily=precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,weather_code,sunrise,sunset` +
    `&forecast_days=7&timezone=auto`;
  const airUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=european_aqi&timezone=auto`;

  type Forecast = {
    current: {
      temperature_2m: number;
      apparent_temperature?: number;
      relative_humidity_2m: number;
      precipitation?: number;
      rain?: number;
      wind_speed_10m: number;
      wind_gusts_10m?: number;
      wind_direction_10m?: number;
      surface_pressure?: number;
      cloud_cover?: number;
      visibility?: number;
      dew_point_2m?: number;
      weather_code?: number;
    };
    hourly: {
      time: string[];
      relative_humidity_2m: number[];
      dew_point_2m?: number[];
      temperature_2m?: number[];
    };
    daily: {
      time: string[];
      precipitation_probability_max: (number | null)[];
      precipitation_sum?: (number | null)[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      wind_speed_10m_max: number[];
      wind_gusts_10m_max?: (number | null)[];
      uv_index_max: (number | null)[];
      weather_code?: (number | null)[];
      sunrise?: string[];
      sunset?: string[];
    };
  };

  const [data, air] = await Promise.all([
    fetchJson<Forecast>(forecastUrl, { cacheMs: 5 * 60 * 1000 }),
    fetchJson<{ current?: { european_aqi?: number } }>(airUrl, {
      retries: 1,
      cacheMs: 10 * 60 * 1000,
    }).catch(() => null),
  ]);

  const airQuality =
    typeof air?.current?.european_aqi === "number" ? Math.round(air.current.european_aqi) : null;

  const dailyHumidity = new Map<string, number[]>();
  data.hourly.time.forEach((stamp, index) => {
    const day = stamp.slice(0, 10);
    const list = dailyHumidity.get(day) ?? [];
    list.push(data.hourly.relative_humidity_2m[index] ?? 0);
    dailyHumidity.set(day, list);
  });

  // Leaves stay wet while the air is near saturation, so count those hours ahead.
  const startIndex = Math.max(
    0,
    data.hourly.time.findIndex((stamp) => new Date(stamp).getTime() >= Date.now() - 3600000),
  );
  const leafWetnessHours = data.hourly.relative_humidity_2m
    .slice(startIndex, startIndex + 24)
    .filter((value) => (value ?? 0) >= 90).length;

  const clockTime = (value?: string) =>
    value
      ? new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "--:--";
  const direction = Math.round(data.current.wind_direction_10m ?? 0);
  const moon = moonPhase();

  const now: WeatherNow = {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature ?? data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    rainChance: Math.round(data.daily.precipitation_probability_max?.[0] ?? 0),
    rainfall:
      Math.round((data.daily.precipitation_sum?.[0] ?? data.current.precipitation ?? 0) * 10) / 10,
    wind: Math.round(data.current.wind_speed_10m),
    windDirection: direction,
    windName: windName(direction),
    windGust: Math.round(
      data.current.wind_gusts_10m ??
        data.daily.wind_gusts_10m_max?.[0] ??
        data.current.wind_speed_10m,
    ),
    pressure: Math.round(data.current.surface_pressure ?? 1013),
    cloudCover: Math.round(data.current.cloud_cover ?? 0),
    uvIndex: Math.round(data.daily.uv_index_max?.[0] ?? 0),
    visibility: Math.round(((data.current.visibility ?? 10000) / 1000) * 10) / 10,
    dewPoint: Math.round(data.current.dew_point_2m ?? data.current.temperature_2m - 4),
    leafWetnessHours,
    moonName: moon.name,
    moonIllumination: moon.illumination,
    sunrise: clockTime(data.daily.sunrise?.[0]),
    sunset: clockTime(data.daily.sunset?.[0]),
    airQuality,
    airQualityLabel: aqiLabel(airQuality),
  };
  const todayCode = data.daily.weather_code?.[0] ?? data.current.weather_code ?? 0;

  const forecast: DayRisk[] = data.daily.time.map((day, index) => {
    const hums = dailyHumidity.get(day) ?? [now.humidity];
    const humidity = Math.round(
      hums.reduce((sum, value) => sum + value, 0) / Math.max(hums.length, 1),
    );
    const tempMax = Math.round(data.daily.temperature_2m_max[index] ?? now.temperature);
    const tempMin = Math.round(data.daily.temperature_2m_min[index] ?? now.temperature);
    const rainChance = Math.round(data.daily.precipitation_probability_max?.[index] ?? 0);
    const rainfall = Math.round((data.daily.precipitation_sum?.[index] ?? 0) * 10) / 10;
    const uvIndex = Math.round(data.daily.uv_index_max?.[index] ?? 0);
    const wind = Math.round(data.daily.wind_speed_10m_max[index] ?? now.wind);
    const score = riskScore({
      humidity,
      rainChance,
      temperature: Math.round((tempMax + tempMin) / 2),
      wind,
    });
    const dateObj = new Date(`${day}T12:00:00`);
    return {
      date: day,
      label:
        index === 0
          ? "Today"
          : index === 1
            ? "Tomorrow"
            : dateObj.toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              }),
      tempMax,
      tempMin,
      humidity,
      rainChance,
      rainfall,
      uvIndex,
      wind,
      score,
      level: levelFromScore(score),
    };
  });

  const score = riskScore(now);
  const level = levelFromScore(score);
  const reason =
    level === "Very High"
      ? "Warm, wet air and long leaf wetness today. This is outbreak weather, so inspect the crop now."
      : level === "High"
        ? "Today's weather may increase the chance of fungal diseases. Check your plants carefully."
        : level === "Medium"
          ? "The weather is a little risky today. Keep an eye on the lower leaves."
          : "The weather is dry and safe for your plants today.";

  const advice =
    level === "High"
      ? [
          "Do not water the leaves today.",
          "Check your plants every day.",
          "Give plants more space for air.",
        ]
      : level === "Medium"
        ? [
            "Water early in the morning.",
            "Look at the lower leaves this week.",
            "Remove weeds around the plants.",
          ]
        : ["Risk is low today.", "Keep your normal care.", "Check the plants once this week."];

  return {
    place: place.country ? `${place.name}, ${place.country}` : place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    now,
    level,
    score,
    reason,
    advice,
    forecast,
    alerts: buildAlerts(now, forecast, todayCode),
    updatedAt: new Date().toISOString(),
  };
}

/** Kept for older callers. */
export async function getWeatherRisk(place: Place) {
  return getWeatherReport(place);
}

export function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("no gps"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

export async function placeFromCoords(latitude: number, longitude: number): Promise<Place> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;
    const response = await fetch(url);
    if (response.ok) {
      const data = (await response.json()) as { results?: { name: string; country?: string }[] };
      const first = data.results?.[0];
      if (first) return { name: first.name, country: first.country ?? "", latitude, longitude };
    }
  } catch {
    /* fall through to plain coordinates */
  }
  return {
    name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    country: "",
    latitude,
    longitude,
  };
}

const CACHE_KEY = "leafcheck.weather.v2";

export function cacheReport(report: WeatherReport) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(report));
  } catch {
    /* optional */
  }
}

export function cachedReport(): WeatherReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as WeatherReport) : null;
  } catch {
    return null;
  }
}
