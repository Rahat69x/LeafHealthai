import type { AnalysisResult } from "./demo-analysis";
import { addToHistory } from "./history";

const KEY = "leafcheck.pending.v2";

/** A photo saved while offline. It has no result yet - we never guess one. */
export interface PendingScan {
  id: string;
  image: string;
  place?: string | undefined;
  weather?: string | undefined;
  date: string;
}

export type ScanRunner = (job: PendingScan) => Promise<AnalysisResult | null>;

export function loadPending(): PendingScan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as PendingScan[]) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item?.image === "string") : [];
  } catch {
    return [];
  }
}

function savePending(items: PendingScan[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage full - we keep only what fits */
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items.slice(-3)));
    } catch {
      /* nothing else we can do */
    }
  }
}

export function queueScan(job: PendingScan) {
  const next = [...loadPending().filter((item) => item.id !== job.id), job].slice(-10);
  savePending(next);
  return next;
}

export function removePending(id: string) {
  const next = loadPending().filter((item) => item.id !== id);
  savePending(next);
  return next;
}

/**
 * Checks the saved photos now that the internet is back. Each one goes through the
 * normal AI pipeline, so a saved scan is never a made up result.
 */
export async function syncPending(
  run: ScanRunner,
): Promise<{ done: AnalysisResult[]; failed: number }> {
  const jobs = loadPending();
  if (!jobs.length) return { done: [], failed: 0 };
  const done: AnalysisResult[] = [];
  const keep: PendingScan[] = [];

  for (const job of jobs) {
    if (!navigator.onLine) {
      keep.push(job);
      continue;
    }
    try {
      const result = await run(job);
      if (result) {
        addToHistory(result);
        done.push(result);
      }
      // A clear refusal (not a leaf, low confidence) is final - do not keep retrying it.
    } catch {
      keep.push(job);
    }
  }

  savePending(keep);
  return { done, failed: keep.length };
}

export function clearPending() {
  savePending([]);
}
