/** RainViewer radar frames. Free, key free, updated every ten minutes. */

import { fetchJson } from "./net";

export interface RadarFrame {
  time: number;
  path: string;
  kind: "past" | "forecast";
}

export interface RadarData {
  host: string;
  radar: RadarFrame[];
  satellite: RadarFrame[];
}

interface RainViewerResponse {
  host: string;
  radar?: { past?: { time: number; path: string }[]; nowcast?: { time: number; path: string }[] };
  satellite?: { infrared?: { time: number; path: string }[] };
}

export async function getRadarData(): Promise<RadarData> {
  const data = await fetchJson<RainViewerResponse>(
    "https://api.rainviewer.com/public/weather-maps.json",
    {
      cacheMs: 5 * 60 * 1000,
    },
  );
  const past = (data.radar?.past ?? []).map((frame) => ({ ...frame, kind: "past" as const }));
  const nowcast = (data.radar?.nowcast ?? []).map((frame) => ({
    ...frame,
    kind: "forecast" as const,
  }));
  const satellite = (data.satellite?.infrared ?? []).map((frame) => ({
    ...frame,
    kind: "past" as const,
  }));
  return {
    host: data.host,
    radar: [...past.slice(-10), ...nowcast.slice(0, 4)],
    satellite: satellite.slice(-4),
  };
}

/** Radar tile. colour 4 is the rain intensity palette, smooth adds blending. */
export function radarTileUrl(
  host: string,
  frame: RadarFrame,
  z: number,
  x: number,
  y: number,
  colour = 4,
) {
  return `${host}${frame.path}/256/${z}/${x}/${y}/${colour}/1_1.png`;
}

export function satelliteTileUrl(host: string, frame: RadarFrame, z: number, x: number, y: number) {
  return `${host}${frame.path}/256/${z}/${x}/${y}/0/0_0.png`;
}

export function baseTileUrl(z: number, x: number, y: number) {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

export function frameLabel(frame: RadarFrame) {
  const time = new Date(frame.time * 1000).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return frame.kind === "forecast" ? `${time} (forecast)` : time;
}

/** Web mercator helpers, so the tile grid lines up with latitude and longitude. */
export function lonToX(lon: number, zoom: number) {
  return ((lon + 180) / 360) * Math.pow(2, zoom);
}

export function latToY(lat: number, zoom: number) {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom);
}
