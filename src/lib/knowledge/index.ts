import { DISEASES } from "./diseases";
import { PESTS } from "./pests";
import { KNOWLEDGE_IMAGES } from "./images";
import { SOURCES } from "./sources";
import type {
  Difficulty,
  KnowledgeCategory,
  KnowledgeEntry,
  Season,
  Severity,
  WeatherTrigger,
} from "./types";

export * from "./types";
export { KNOWLEDGE_IMAGES, SOURCES };

/** Full library. Add new entries to diseases.ts / pests.ts — nothing else changes. */
export const KNOWLEDGE: KnowledgeEntry[] = [...DISEASES, ...PESTS];

const BY_SLUG = new Map(KNOWLEDGE.map((e) => [e.slug, e]));

export function getEntry(slug: string): KnowledgeEntry | undefined {
  return BY_SLUG.get(slug);
}

export function entryImage(entry: KnowledgeEntry): string {
  return KNOWLEDGE_IMAGES[entry.image];
}

export const SEVERITY_ORDER: Severity[] = ["Low", "Medium", "High", "Very High"];

/** Every plant mentioned by any entry, de-duplicated and sorted. */
export const ALL_PLANTS: string[] = Array.from(new Set(KNOWLEDGE.flatMap((e) => e.plants))).sort(
  (a, b) => a.localeCompare(b),
);

export const ALL_SEASONS: Season[] = [
  "Spring",
  "Summer",
  "Monsoon",
  "Autumn",
  "Winter",
  "All year",
];

export const ALL_WEATHER: WeatherTrigger[] = Array.from(
  new Set(KNOWLEDGE.flatMap((e) => e.weather)),
).sort((a, b) => a.localeCompare(b));

export const ALL_DIFFICULTY: Difficulty[] = ["Easy", "Moderate", "Hard"];

export interface KnowledgeFilters {
  query?: string;
  category?: KnowledgeCategory | "all";
  plant?: string | "all";
  severity?: Severity | "all";
  season?: Season | "all";
  weather?: WeatherTrigger | "all";
  difficulty?: Difficulty | "all";
}

interface Scored {
  entry: KnowledgeEntry;
  score: number;
}

function normalise(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Weighted match across name, plant, symptom and tag text so a search for
 * "yellow spots on tomato" still finds the right card.
 */
function scoreEntry(entry: KnowledgeEntry, terms: string[]): number {
  if (terms.length === 0) return 1;
  const name = normalise(entry.name);
  const sci = normalise(entry.scientificName);
  const plants = normalise(entry.plants.join(" "));
  const symptoms = normalise([...entry.symptoms, ...entry.identification].join(" "));
  const tags = normalise(entry.tags.join(" "));
  const rest = normalise([entry.summary, entry.kind, ...entry.causes].join(" "));

  let score = 0;
  for (const term of terms) {
    let hit = 0;
    if (name === term) hit += 40;
    else if (name.includes(term)) hit += 24;
    if (sci.includes(term)) hit += 16;
    if (plants.includes(term)) hit += 12;
    if (tags.includes(term)) hit += 10;
    if (symptoms.includes(term)) hit += 8;
    if (rest.includes(term)) hit += 4;
    if (hit === 0) return 0; // every term must match somewhere
    score += hit;
  }
  return score + entry.popularity / 100;
}

export function searchKnowledge(filters: KnowledgeFilters = {}): KnowledgeEntry[] {
  const terms = normalise(filters.query ?? "")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const scored: Scored[] = [];
  for (const entry of KNOWLEDGE) {
    if (filters.category && filters.category !== "all" && entry.category !== filters.category)
      continue;
    if (filters.plant && filters.plant !== "all" && !entry.plants.includes(filters.plant)) continue;
    if (filters.severity && filters.severity !== "all" && entry.severity !== filters.severity)
      continue;
    if (filters.season && filters.season !== "all" && !entry.seasons.includes(filters.season))
      continue;
    if (filters.weather && filters.weather !== "all" && !entry.weather.includes(filters.weather))
      continue;
    if (
      filters.difficulty &&
      filters.difficulty !== "all" &&
      entry.difficulty !== filters.difficulty
    )
      continue;

    const score = scoreEntry(entry, terms);
    if (score <= 0) continue;
    scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score || b.entry.popularity - a.entry.popularity);
  return scored.map((s) => s.entry);
}

/** Suggestions for the search box: names, plants and common symptom words. */
export function searchSuggestions(query: string, limit = 6): string[] {
  const q = normalise(query);
  if (q.length < 2) return [];
  const pool = new Set<string>();
  for (const entry of KNOWLEDGE) {
    if (normalise(entry.name).includes(q)) pool.add(entry.name);
    for (const plant of entry.plants) if (normalise(plant).includes(q)) pool.add(plant);
    for (const tag of entry.tags) if (normalise(tag).includes(q)) pool.add(tag);
    if (pool.size >= limit * 3) break;
  }
  return Array.from(pool).slice(0, limit);
}

export function trendingEntries(limit = 6): KnowledgeEntry[] {
  return [...KNOWLEDGE].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

export function recentEntries(limit = 4): KnowledgeEntry[] {
  return [...KNOWLEDGE].sort((a, b) => b.added.localeCompare(a.added)).slice(0, limit);
}

/** Explicit related list first, then same-plant fallbacks so we always fill the row. */
export function relatedEntries(entry: KnowledgeEntry, limit = 4): KnowledgeEntry[] {
  const picked: KnowledgeEntry[] = [];
  const seen = new Set([entry.slug]);
  for (const slug of entry.related) {
    const found = BY_SLUG.get(slug);
    if (found && !seen.has(found.slug)) {
      picked.push(found);
      seen.add(found.slug);
    }
  }
  if (picked.length < limit) {
    const fallback = KNOWLEDGE.filter(
      (e) => !seen.has(e.slug) && e.plants.some((p) => entry.plants.includes(p)),
    ).sort((a, b) => b.popularity - a.popularity);
    for (const e of fallback) {
      if (picked.length >= limit) break;
      picked.push(e);
      seen.add(e.slug);
    }
  }
  return picked.slice(0, limit);
}

export const KNOWLEDGE_STATS = {
  total: KNOWLEDGE.length,
  diseases: DISEASES.length,
  pests: PESTS.length,
  plants: ALL_PLANTS.length,
  sources: SOURCES.length,
};
