import type { AnalysisResult } from "./demo-analysis";

/** A simple care calendar kept on the device. Tasks come from the scans and the season. */

export type TaskKind = "water" | "fertiliser" | "inspect" | "prune" | "harvest" | "spray";

export interface CareTask {
  id: string;
  kind: TaskKind;
  title: string;
  why: string;
  due: string;
  plant?: string;
  priority: "High" | "Medium" | "Low";
  custom?: boolean;
}

export interface CareState {
  done: Record<string, string>;
  custom: CareTask[];
  removed: string[];
}

const KEY = "leafcheck.care.v1";
const DAY = 86400000;

export const TASK_LABEL: Record<TaskKind, string> = {
  water: "Watering",
  fertiliser: "Fertiliser",
  inspect: "Disease inspection",
  prune: "Pruning",
  harvest: "Harvest check",
  spray: "Treatment spray",
};

export function loadCare(): CareState {
  if (typeof window === "undefined") return { done: {}, custom: [], removed: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<CareState>) : {};
    return { done: parsed.done ?? {}, custom: parsed.custom ?? [], removed: parsed.removed ?? [] };
  } catch {
    return { done: {}, custom: [], removed: [] };
  }
}

export function saveCare(state: CareState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* optional */
  }
}

function iso(base: number, days: number) {
  const date = new Date(base + days * DAY);
  date.setHours(8, 0, 0, 0);
  return date.toISOString();
}

/**
 * Builds the calendar from real events: every diseased scan creates follow up
 * inspections and treatment days, every plant gets watering and feeding rhythm.
 */
export function buildTasks(
  history: AnalysisResult[],
  watering: "water" | "water-morning" | "reduce" | "skip" = "water",
): CareTask[] {
  const tasks: CareTask[] = [];
  const today = new Date().setHours(8, 0, 0, 0);

  if (watering !== "skip") {
    tasks.push({
      id: `water-${new Date(today).toISOString().slice(0, 10)}`,
      kind: "water",
      title:
        watering === "water-morning"
          ? "Water early in the morning"
          : watering === "reduce"
            ? "Water lightly (about 30% less)"
            : "Water the plants",
      why: "Based on today's rain forecast, temperature and humidity.",
      due: iso(today, watering === "water-morning" ? 1 : 0),
      priority: "Medium",
    });
  }

  const plants = [...new Set(history.map((item) => item.plant))].slice(0, 6);
  for (const plant of plants) {
    const last = history.find((item) => item.plant === plant)!;
    const lastTime = new Date(last.date).setHours(8, 0, 0, 0);
    tasks.push({
      id: `fert-${plant}-${new Date(lastTime + 21 * DAY).toISOString().slice(0, 10)}`,
      kind: "fertiliser",
      title: `Feed the ${plant} plants`,
      why: "Plants use up soil nutrients about every three weeks during growth.",
      due: iso(lastTime, 21),
      plant,
      priority: "Low",
    });
    tasks.push({
      id: `prune-${plant}-${new Date(lastTime + 14 * DAY).toISOString().slice(0, 10)}`,
      kind: "prune",
      title: `Remove old lower leaves from ${plant}`,
      why: "Open leaves dry faster and fungus spreads less.",
      due: iso(lastTime, 14),
      plant,
      priority: "Low",
    });
  }

  const sickCases = new Map<string, AnalysisResult>();
  for (const item of history) {
    if (item.healthy) continue;
    const key = `${item.plant}|${item.disease}`;
    const seen = sickCases.get(key);
    if (!seen || new Date(item.date) > new Date(seen.date)) sickCases.set(key, item);
  }

  for (const [key, scan] of sickCases) {
    const base = new Date(scan.date).setHours(8, 0, 0, 0);
    const slug = key.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    tasks.push({
      id: `inspect-${slug}-3`,
      kind: "inspect",
      title: `Check the ${scan.plant} leaves again`,
      why: `A follow up photo three days after ${scan.disease} shows if the treatment is working.`,
      due: iso(base, 3),
      plant: scan.plant,
      priority: scan.severity === "High" ? "High" : "Medium",
    });
    tasks.push({
      id: `inspect-${slug}-7`,
      kind: "inspect",
      title: `Second check for ${scan.plant}`,
      why: "One week later the disease should be smaller, not bigger.",
      due: iso(base, 7),
      plant: scan.plant,
      priority: "Medium",
    });
    if (scan.severity !== "Low") {
      tasks.push({
        id: `spray-${slug}`,
        kind: "spray",
        title: `Treat the ${scan.plant} for ${scan.disease}`,
        why: "Follow the treatment steps in the result card, on a calm dry morning.",
        due: iso(base, 1),
        plant: scan.plant,
        priority: scan.severity === "High" ? "High" : "Medium",
      });
    }
    tasks.push({
      id: `harvest-${slug}`,
      kind: "harvest",
      title: `Check ${scan.plant} fruit before harvest`,
      why: "Wait for the safe period after any spray before you pick and sell.",
      due: iso(base, 21),
      plant: scan.plant,
      priority: "Low",
    });
  }

  return tasks;
}

export function mergeTasks(generated: CareTask[], state: CareState) {
  const all = [...generated.filter((task) => !state.removed.includes(task.id)), ...state.custom];
  return all
    .map((task) => ({ ...task, doneAt: state.done[task.id] }))
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
}

export type MergedTask = CareTask & { doneAt?: string | undefined };

export function isOverdue(task: MergedTask) {
  return !task.doneAt && new Date(task.due).getTime() < Date.now() - DAY;
}

export function dueLabel(due: string) {
  const days = Math.round(
    (new Date(due).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `In ${days} days`;
}
