/** Saved locations: favourites the farmer can rename, delete and switch between. */

import type { Suggestion } from "./place-search";

const KEY = "leafcheck.favourite-places.v1";
const LAST_KEY = "leafcheck.last-place.v1";

export interface FavouritePlace {
  id: string;
  label: string;
  name: string;
  detail: string;
  latitude: number;
  longitude: number;
}

function read(): FavouritePlace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavouritePlace[]) : [];
  } catch {
    return [];
  }
}

function write(list: FavouritePlace[]): FavouritePlace[] {
  if (typeof window === "undefined") return list;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage is optional */
  }
  return list;
}

export function loadFavourites(): FavouritePlace[] {
  return read();
}

export function isFavourite(latitude: number, longitude: number): boolean {
  return read().some((item) => sameSpot(item, latitude, longitude));
}

function sameSpot(item: FavouritePlace, latitude: number, longitude: number) {
  return Math.abs(item.latitude - latitude) < 0.02 && Math.abs(item.longitude - longitude) < 0.02;
}

export function addFavourite(place: {
  name: string;
  detail?: string;
  latitude: number;
  longitude: number;
}): FavouritePlace[] {
  const list = read();
  if (list.some((item) => sameSpot(item, place.latitude, place.longitude))) return list;
  const entry: FavouritePlace = {
    id: `fav-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    label: place.name,
    name: place.name,
    detail: place.detail ?? "",
    latitude: place.latitude,
    longitude: place.longitude,
  };
  return write([entry, ...list].slice(0, 12));
}

export function renameFavourite(id: string, label: string): FavouritePlace[] {
  return write(
    read().map((item) => (item.id === id ? { ...item, label: label.trim() || item.name } : item)),
  );
}

export function removeFavourite(id: string): FavouritePlace[] {
  return write(read().filter((item) => item.id !== id));
}

export function toSuggestion(item: FavouritePlace): Suggestion {
  return {
    id: item.id,
    name: item.name,
    detail: item.detail,
    latitude: item.latitude,
    longitude: item.longitude,
    country: "",
  };
}

/** The place the farmer looked at last, so the page opens where they left off. */
export function saveLastPlace(place: {
  name: string;
  detail?: string;
  latitude: number;
  longitude: number;
}) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_KEY, JSON.stringify(place));
  } catch {
    /* optional */
  }
}

export function loadLastPlace(): {
  name: string;
  detail?: string;
  latitude: number;
  longitude: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_KEY);
    return raw ? (JSON.parse(raw) as { name: string; latitude: number; longitude: number }) : null;
  } catch {
    return null;
  }
}
