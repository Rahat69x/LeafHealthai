import type { MergedTask } from "./care-schedule";
import { dueLabel, isOverdue } from "./care-schedule";
import type { AnalysisResult } from "./demo-analysis";
import type { Outbreak } from "./outbreak";
import type { SprayAdvice } from "./spray-advisor";
import type { WeatherReport } from "./weather";

export interface Notice {
  id: string;
  title: string;
  detail: string;
  tone: "danger" | "warn" | "info" | "good";
  priority: "High" | "Medium" | "Low";
  link?: "/" | "/advisor" | "/care" | "/outbreaks" | "/weather";
}

const SEEN_KEY = "leafcheck.notices.seen";

export function loadSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function markSeen(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SEEN_KEY,
      JSON.stringify([...new Set([...loadSeen(), ...ids])].slice(-200)),
    );
  } catch {
    /* optional */
  }
}

export function buildNotices(input: {
  report: WeatherReport | null;
  spray: SprayAdvice | null;
  tasks: MergedTask[];
  history: AnalysisResult[];
  outbreaks: Outbreak[];
}): Notice[] {
  const notices: Notice[] = [];
  const { report, spray, tasks, history, outbreaks } = input;

  if (report && (report.level === "High" || report.level === "Very High")) {
    notices.push({
      id: `risk-${report.updatedAt.slice(0, 13)}`,
      title: `${report.level} disease risk in ${report.place}`,
      detail: report.reason,
      tone: "danger",
      priority: "High",
      link: "/weather",
    });
  }

  const heavyRain = report?.forecast.find((day) => day.rainfall >= 20 || day.rainChance >= 85);
  if (heavyRain) {
    notices.push({
      id: `rain-${heavyRain.date}`,
      title: `Heavy rain expected ${heavyRain.label.toLowerCase()}`,
      detail: `About ${heavyRain.rainfall} mm with a ${heavyRain.rainChance}% chance. Drain the field and do not spray just before it.`,
      tone: "warn",
      priority: "High",
      link: "/weather",
    });
  }

  if (spray) {
    const best = spray.windows[0];
    if (spray.decision === "spray-now") {
      notices.push({
        id: `spray-now-${new Date().toISOString().slice(0, 13)}`,
        title: "Good time to spray right now",
        detail: spray.reasons[0] ?? "Calm, dry and not too hot.",
        tone: "good",
        priority: "Medium",
        link: "/advisor",
      });
    } else if (best) {
      notices.push({
        id: `spray-window-${best.start}`,
        title: `Best spraying time: ${best.label}`,
        detail: spray.reasons[0] ?? "Wait for calmer, drier weather.",
        tone: "info",
        priority: "Medium",
        link: "/advisor",
      });
    }
  }

  for (const task of tasks) {
    if (isOverdue(task)) {
      notices.push({
        id: `task-${task.id}`,
        title: `Missed: ${task.title}`,
        detail: `${dueLabel(task.due)}. ${task.why}`,
        tone: "warn",
        priority: task.priority,
        link: "/care",
      });
    }
  }

  const lastSick = history.find((scan) => !scan.healthy);
  if (lastSick) {
    const days = Math.round((Date.now() - new Date(lastSick.date).getTime()) / 86400000);
    const followed = history.some(
      (scan) => scan.plant === lastSick.plant && new Date(scan.date) > new Date(lastSick.date),
    );
    if (days >= 3 && !followed) {
      notices.push({
        id: `follow-${lastSick.id}`,
        title: `Take a follow up photo of the ${lastSick.plant}`,
        detail: `${days} days since ${lastSick.disease} was found. A new photo shows if the treatment is working.`,
        tone: "info",
        priority: "High",
        link: "/",
      });
    }
  }

  for (const outbreak of outbreaks) {
    if (outbreak.level === "Watch") continue;
    notices.push({
      id: `outbreak-${outbreak.area}-${outbreak.disease}-${outbreak.reports}`,
      title: `Possible ${outbreak.disease} outbreak in ${outbreak.area}`,
      detail: `${outbreak.reports} reports in the last 14 days on ${outbreak.crops.join(", ")}.`,
      tone: "danger",
      priority: "High",
      link: "/outbreaks",
    });
  }

  const order = { High: 0, Medium: 1, Low: 2 } as const;
  return notices.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 12);
}
