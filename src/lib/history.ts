import type { AnalysisResult } from "./demo-analysis";

const KEY = "leafcheck.history.v1";
const LIMIT = 30;

export function loadHistory(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: AnalysisResult[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, LIMIT)));
  } catch {
    /* storage full or blocked - history is optional */
  }
}

export function addToHistory(item: AnalysisResult) {
  const next = [item, ...loadHistory().filter((entry) => entry.id !== item.id)].slice(0, LIMIT);
  saveHistory(next);
  return next;
}

export function updateInHistory(id: string, patch: Partial<AnalysisResult>) {
  const next = loadHistory().map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
  saveHistory(next);
  return next;
}

export function removeFromHistory(id: string) {
  const next = loadHistory().filter((entry) => entry.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  saveHistory([]);
  return [];
}

export function searchHistory(items: AnalysisResult[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    [item.plant, item.disease, item.quality, item.place ?? ""].join(" ").toLowerCase().includes(q),
  );
}

export function formatWhen(iso: string) {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

export interface Stats {
  total: number;
  healthy: number;
  diseased: number;
  today: number;
  week: number;
  common: string;
  averageConfidence: number;
}

export function buildStats(items: AnalysisResult[]): Stats {
  const now = Date.now();
  const dayStart = new Date().setHours(0, 0, 0, 0);
  const counts = new Map<string, number>();
  let healthy = 0;
  let today = 0;
  let week = 0;
  let confidence = 0;

  for (const item of items) {
    const time = new Date(item.date).getTime();
    if (item.healthy) healthy += 1;
    else counts.set(item.disease, (counts.get(item.disease) ?? 0) + 1);
    if (time >= dayStart) today += 1;
    if (now - time <= 7 * 24 * 60 * 60 * 1000) week += 1;
    confidence += item.confidence;
  }

  const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None yet";

  return {
    total: items.length,
    healthy,
    diseased: items.length - healthy,
    today,
    week,
    common,
    averageConfidence: items.length ? Math.round(confidence / items.length) : 0,
  };
}

/** Groups checks of the same plant and disease so users can see if things improve. */
export function progressGroups(items: AnalysisResult[]) {
  const groups = new Map<string, AnalysisResult[]>();
  for (const item of items) {
    const key = `${item.plant} · ${item.disease}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([key, list]) => {
      const sorted = [...list].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const first = sorted[0]!;
      const last = sorted[sorted.length - 1]!;
      const order = { Low: 1, Medium: 2, High: 3 } as const;
      const change =
        last.healthy && !first.healthy
          ? "Better"
          : order[last.severity] < order[first.severity]
            ? "Better"
            : order[last.severity] > order[first.severity]
              ? "Worse"
              : "Same";
      return { key, first, last, count: sorted.length, change };
    });
}
