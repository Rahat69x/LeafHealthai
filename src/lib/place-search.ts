/**
 * Location search used by the autocomplete box.
 * Local list answers in well under a millisecond; the geocoding service fills in
 * anything the local list does not know, and every remote answer is cached.
 */

import { LOCAL_PLACES, type LocalPlace } from "./bd-places";
import type { Place } from "./weather";

export interface Suggestion {
  id: string;
  /** Main line, e.g. "Dhamrai". */
  name: string;
  /** Second line, e.g. "Dhaka district, Bangladesh". */
  detail: string;
  latitude: number;
  longitude: number;
  country: string;
  /** Set when the suggestion came from the built-in list. */
  local?: LocalPlace;
}

export const MIN_QUERY = 1;

export function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0980-\u09ff ]+/g, "")
    .trim();
}

/** Small edit distance, capped so long words stay cheap. */
function editDistance(a: string, b: string, cap = 2) {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min((row[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
      row[j] = value;
      if (value < best) best = value;
    }
    if (best > cap) return cap + 1;
    prev = row;
  }
  return prev[b.length] ?? cap + 1;
}

interface Indexed {
  place: LocalPlace;
  terms: string[];
}

const INDEX: Indexed[] = LOCAL_PLACES.map((place) => ({
  place,
  terms: [place.name, ...(place.aliases ?? []), place.parent, place.division].map(normalise),
}));

/** Higher is better; 0 means no match. */
function scoreTerm(term: string, query: string) {
  if (!term) return 0;
  if (term === query) return 100;
  if (term.startsWith(query)) return 80 - Math.min(20, term.length - query.length);
  const words = term.split(" ");
  if (words.some((word) => word.startsWith(query))) return 60;
  if (term.includes(query)) return 45;
  if (query.length >= 4) {
    const cap = query.length >= 7 ? 2 : 1;
    if (editDistance(term.slice(0, query.length + cap), query, cap) <= cap) return 34;
    if (words.some((word) => editDistance(word, query, cap) <= cap)) return 30;
  }
  return 0;
}

function detailFor(place: LocalPlace) {
  if (place.country !== "Bangladesh") return `${place.division}, ${place.country}`;
  if (place.kind === "district") return `${place.division} division, Bangladesh`;
  return `${place.parent} district, Bangladesh`;
}

export function searchLocal(query: string, limit = 8): Suggestion[] {
  const q = normalise(query);
  if (q.length < MIN_QUERY) return [];
  const scored: { score: number; place: LocalPlace }[] = [];
  for (const entry of INDEX) {
    let best = 0;
    for (let i = 0; i < entry.terms.length; i += 1) {
      // Name and aliases matter more than the parent district.
      const weight = i === 0 ? 1 : i < (entry.place.aliases?.length ?? 0) + 1 ? 0.95 : 0.55;
      const value = scoreTerm(entry.terms[i] ?? "", q) * weight;
      if (value > best) best = value;
    }
    if (best > 0) {
      // Districts float above upazilas when the score ties.
      scored.push({ score: best + (entry.place.kind === "district" ? 2 : 0), place: entry.place });
    }
  }
  scored.sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name));
  return scored.slice(0, limit).map(({ place }) => ({
    id: `local:${place.country}:${place.parent}:${place.name}`,
    name: place.name,
    detail: detailFor(place),
    latitude: place.latitude,
    longitude: place.longitude,
    country: place.country,
    local: place,
  }));
}

const remoteCache = new Map<string, Suggestion[]>();

interface GeoResult {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  latitude: number;
  longitude: number;
}

/** Wider search through Open-Meteo geocoding. Results are cached per query. */
export async function searchRemote(query: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const q = normalise(query);
  if (q.length < 2) return [];
  const cached = remoteCache.get(q);
  if (cached) return cached;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) throw new Error("place lookup failed");
  const data = (await response.json()) as { results?: GeoResult[] };
  const list: Suggestion[] = (data.results ?? []).map((item) => ({
    id: `geo:${item.id ?? `${item.latitude},${item.longitude}`}`,
    name: item.name,
    detail: [item.admin2, item.admin1, item.country].filter(Boolean).join(", "),
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country ?? "",
  }));
  remoteCache.set(q, list);
  return list;
}

/** Drops remote rows that repeat a local suggestion. */
export function mergeSuggestions(
  local: Suggestion[],
  remote: Suggestion[],
  limit = 10,
): Suggestion[] {
  const seen = new Set(local.map((item) => `${normalise(item.name)}|${item.country}`));
  const merged = [...local];
  for (const item of remote) {
    const key = `${normalise(item.name)}|${item.country}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged.slice(0, limit);
}

export function toPlace(suggestion: Suggestion): Place {
  return {
    name: suggestion.name,
    country: suggestion.country,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
  };
}

/** Splits a label so the matching part can be highlighted. */
export function highlightParts(label: string, query: string): { text: string; hit: boolean }[] {
  const q = normalise(query);
  if (!q) return [{ text: label, hit: false }];
  const hay = normalise(label);
  const start = hay.indexOf(q);
  if (start < 0 || hay.length !== label.length) return [{ text: label, hit: false }];
  return [
    { text: label.slice(0, start), hit: false },
    { text: label.slice(start, start + q.length), hit: true },
    { text: label.slice(start + q.length), hit: false },
  ].filter((part) => part.text.length > 0);
}
