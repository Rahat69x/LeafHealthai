import { clockLabel, dayLabel, type HourPoint } from "./hourly-weather";

/**
 * Decides when spraying is safe. Rain washes the spray off, wind blows it away,
 * strong sun burns wet leaves, and very still air keeps the droplets hanging.
 */

export interface SprayWindow {
  start: string;
  end: string;
  dayLabel: string;
  label: string;
  score: number;
  notes: string[];
}

export interface SprayAdvice {
  decision: "spray-now" | "wait" | "do-not-spray";
  headline: string;
  reasons: string[];
  windows: SprayWindow[];
  nextRainHours: number | null;
  nextRainLabel: string | null;
}

function hourScore(hour: HourPoint, rainAfter: number) {
  const notes: string[] = [];
  let score = 100;

  if (rainAfter >= 60) {
    score -= 70;
    notes.push("Rain is likely within 6 hours, so the spray would wash off.");
  } else if (rainAfter >= 30) {
    score -= 35;
    notes.push("Some chance of rain within 6 hours.");
  }
  if (hour.rainChance >= 50) {
    score -= 30;
    notes.push("Rain expected in this hour.");
  }
  if (hour.windGust >= 20 || hour.wind >= 15) {
    score -= 40;
    notes.push(`Wind is ${hour.wind} km/h, so the spray will drift away.`);
  } else if (hour.wind < 3) {
    score -= 10;
    notes.push("Air is very still, droplets may hang and not settle.");
  }
  if (hour.temperature >= 32) {
    score -= 30;
    notes.push(`It is ${hour.temperature}C, too hot. The spray dries before it works.`);
  }
  if (hour.uvIndex >= 8) {
    score -= 25;
    notes.push("Strong sun can burn wet leaves.");
  }
  if (hour.humidity >= 95) {
    score -= 15;
    notes.push("Air is almost saturated, leaves stay wet too long.");
  }

  const clock = new Date(hour.time).getHours();
  if (clock >= 6 && clock <= 9) {
    score += 15;
    notes.push("Early morning is the best time of day for spraying.");
  } else if (clock >= 16 && clock <= 18) {
    score += 10;
    notes.push("Late afternoon is a good time of day for spraying.");
  } else if (clock < 5 || clock > 19) {
    score -= 30;
    notes.push("It is dark, spraying is not practical.");
  }

  return { score: Math.max(0, Math.min(100, score)), notes };
}

export function sprayAdvice(hours: HourPoint[]): SprayAdvice {
  if (!hours.length) {
    return {
      decision: "wait",
      headline: "We need weather data before we can advise on spraying.",
      reasons: ["Set your area so we can read the hourly forecast."],
      windows: [],
      nextRainHours: null,
      nextRainLabel: null,
    };
  }

  const scored = hours.map((hour, index) => {
    const ahead = hours.slice(index, index + 6);
    const rainAfter = Math.max(...ahead.map((item) => item.rainChance), 0);
    return { hour, ...hourScore(hour, rainAfter) };
  });

  const rainIndex = hours.findIndex((hour) => hour.rainChance >= 60 || hour.rain >= 0.5);
  const nextRainHours = rainIndex >= 0 ? rainIndex : null;
  const nextRainLabel =
    rainIndex >= 0
      ? `${dayLabel(hours[rainIndex]!.time)} ${clockLabel(hours[rainIndex]!.time)}`
      : null;

  const windows: SprayWindow[] = [];
  let run: typeof scored = [];
  const flush = () => {
    if (run.length >= 2) {
      const first = run[0]!;
      const last = run[run.length - 1]!;
      const notes = [...new Set(run.flatMap((item) => item.notes))].filter(
        (note) => !note.includes("not practical"),
      );
      windows.push({
        start: first.hour.time,
        end: last.hour.time,
        dayLabel: dayLabel(first.hour.time),
        label: `${dayLabel(first.hour.time)} ${clockLabel(first.hour.time)} - ${clockLabel(last.hour.time)}`,
        score: Math.round(run.reduce((sum, item) => sum + item.score, 0) / run.length),
        notes: notes.slice(0, 3),
      });
    }
    run = [];
  };
  for (const item of scored) {
    if (item.score >= 65) run.push(item);
    else flush();
  }
  flush();
  windows.sort(
    (a, b) => b.score - a.score || new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const now = scored[0]!;
  const best = windows[0];
  const reasons: string[] = [];

  if (now.score >= 70) {
    reasons.push(...now.notes.slice(0, 3));
    if (!reasons.length) reasons.push("Weather right now is calm, dry and not too hot.");
    return {
      decision: "spray-now",
      headline: "You can spray now. Conditions are good for the next few hours.",
      reasons,
      windows: windows.slice(0, 3),
      nextRainHours,
      nextRainLabel,
    };
  }

  reasons.push(...now.notes.slice(0, 3));
  if (nextRainHours !== null && nextRainHours <= 6) {
    reasons.unshift(
      `Rain is expected in about ${Math.max(nextRainHours, 1)} hour${nextRainHours > 1 ? "s" : ""}.`,
    );
  }

  if (best) {
    return {
      decision: "wait",
      headline: `Do not spray now. Best time is ${best.label}.`,
      reasons,
      windows: windows.slice(0, 3),
      nextRainHours,
      nextRainLabel,
    };
  }

  return {
    decision: "do-not-spray",
    headline: "Do not spray in the next two days. The weather is against it.",
    reasons: reasons.length
      ? reasons
      : ["Rain, wind or heat make spraying a waste in the next 48 hours."],
    windows: [],
    nextRainHours,
    nextRainLabel,
  };
}
