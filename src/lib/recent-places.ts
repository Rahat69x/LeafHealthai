/** Recent and popular locations for the weather search box. */

import type { Suggestion } from "./place-search";
import { LOCAL_PLACES } from "./bd-places";

const KEY = "leafcheck.recent-places.v1";
const LIMIT = 6;

const POPULAR_NAMES = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Rangpur",
  "Bogura",
  "Mymensingh",
];

export const POPULAR_PLACES: Suggestion[] = POPULAR_NAMES.flatMap((name) => {
  const place = LOCAL_PLACES.find((item) => item.name === name);
  if (!place) return [];
  return [
    {
      id: `popular:${place.name}`,
      name: place.name,
      detail: `${place.division} division, ${place.country}`,
      latitude: place.latitude,
      longitude: place.longitude,
      country: place.country,
      local: place,
    },
  ];
});

export function loadRecentPlaces(): Suggestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Suggestion[]).slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

export function rememberPlace(item: Suggestion): Suggestion[] {
  if (typeof window === "undefined") return [];
  const next = [item, ...loadRecentPlaces().filter((entry) => entry.id !== item.id)].slice(
    0,
    LIMIT,
  );
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage is optional */
  }
  return next;
}

export function clearRecentPlaces() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* optional */
  }
}
