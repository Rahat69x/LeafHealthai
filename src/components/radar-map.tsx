import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  baseTileUrl,
  frameLabel,
  getRadarData,
  latToY,
  lonToX,
  radarTileUrl,
  satelliteTileUrl,
  type RadarData,
} from "@/lib/radar";

const TILE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 10;

interface Props {
  latitude: number;
  longitude: number;
  place: string;
}

/**
 * A small slippy map built on plain tiles: OpenStreetMap for the ground,
 * RainViewer for rain and cloud. Keeps the bundle free of a map library.
 */
export function RadarMap({ latitude, longitude, place }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 640, height: 380 });
  const [zoom, setZoom] = useState(7);
  const [centre, setCentre] = useState({ lat: latitude, lon: longitude });
  const [data, setData] = useState<RadarData | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [showClouds, setShowClouds] = useState(false);
  const [full, setFull] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCentre({ lat: latitude, lon: longitude });
  }, [latitude, longitude]);

  useEffect(() => {
    let alive = true;
    getRadarData()
      .then((value) => {
        if (!alive) return;
        setData(value);
        setIndex(Math.max(0, value.radar.length - 5));
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !data || data.radar.length < 2) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % data.radar.length), 700);
    return () => clearInterval(timer);
  }, [playing, data]);

  const frame = data?.radar[Math.min(index, data.radar.length - 1)];
  const cloudFrame = data?.satellite[data.satellite.length - 1];

  // Where the centre sits in world tile units at this zoom.
  const centreX = lonToX(centre.lon, zoom);
  const centreY = latToY(centre.lat, zoom);

  const tiles = useMemo(() => {
    const cols = Math.ceil(size.width / TILE) + 2;
    const rows = Math.ceil(size.height / TILE) + 2;
    const startX = Math.floor(centreX - cols / 2);
    const startY = Math.floor(centreY - rows / 2);
    const max = Math.pow(2, zoom);
    const list: { key: string; x: number; y: number; left: number; top: number }[] = [];
    for (let dx = 0; dx < cols; dx += 1) {
      for (let dy = 0; dy < rows; dy += 1) {
        const tx = startX + dx;
        const ty = startY + dy;
        if (ty < 0 || ty >= max) continue;
        const wrapped = ((tx % max) + max) % max;
        list.push({
          key: `${tx}-${ty}`,
          x: wrapped,
          y: ty,
          left: (tx - centreX) * TILE + size.width / 2,
          top: (ty - centreY) * TILE + size.height / 2,
        });
      }
    }
    return list;
  }, [centreX, centreY, size.width, size.height, zoom]);

  const panBy = useCallback(
    (dxPixels: number, dyPixels: number) => {
      setCentre((current) => {
        const scale = Math.pow(2, zoom);
        const x = lonToX(current.lon, zoom) - dxPixels / TILE;
        const y = Math.min(
          scale - 0.01,
          Math.max(0.01, latToY(current.lat, zoom) - dyPixels / TILE),
        );
        const lon = (x / scale) * 360 - 180;
        const n = Math.PI - 2 * Math.PI * (y / scale);
        const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
        return { lat, lon: ((((lon + 180) % 360) + 360) % 360) - 180 };
      });
    },
    [zoom],
  );

  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      setZoom((value) =>
        Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value - Math.sign(delta)))),
      );
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  const toggleFull = async () => {
    const element = boxRef.current?.parentElement;
    if (!element) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setFull(false);
      } else {
        await element.requestFullscreen();
        setFull(true);
      }
    } catch {
      setFull((value) => !value);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="text-lg">Rain radar around {place}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={showRadar ? "default" : "outline"}
            onClick={() => setShowRadar((v) => !v)}
          >
            Rain
          </Button>
          <Button
            size="sm"
            variant={showClouds ? "default" : "outline"}
            onClick={() => setShowClouds((v) => !v)}
          >
            Clouds
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? "Pause radar animation" : "Play radar animation"}
          >
            {playing ? <Leaf className="size-4" /> : <Droplet className="size-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFull}
            aria-label={full ? "Exit fullscreen radar" : "Fullscreen radar"}
          >
            {full ? <ShieldCheck className="size-4" /> : <Leaf className="size-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={boxRef}
          className="relative h-[340px] w-full cursor-grab touch-none overflow-hidden rounded-xl border bg-muted active:cursor-grabbing sm:h-[420px]"
          onPointerDown={(event) => {
            drag.current = { x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            const dx = event.clientX - drag.current.x;
            const dy = event.clientY - drag.current.y;
            drag.current = { x: event.clientX, y: event.clientY };
            panBy(dx, dy);
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {tiles.map((tile) => (
            <img
              key={`base-${tile.key}`}
              src={baseTileUrl(zoom, tile.x, tile.y)}
              alt=""
              draggable={false}
              loading="lazy"
              className="pointer-events-none absolute size-64 max-w-none opacity-90"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
          {showClouds && data && cloudFrame
            ? tiles.map((tile) => (
                <img
                  key={`cloud-${tile.key}`}
                  src={satelliteTileUrl(data.host, cloudFrame, zoom, tile.x, tile.y)}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute size-64 max-w-none opacity-50"
                  style={{ left: tile.left, top: tile.top }}
                />
              ))
            : null}
          {showRadar && data && frame
            ? tiles.map((tile) => (
                <img
                  key={`radar-${tile.key}-${frame.time}`}
                  src={radarTileUrl(data.host, frame, zoom, tile.x, tile.y)}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute size-64 max-w-none opacity-80"
                  style={{ left: tile.left, top: tile.top }}
                />
              ))
            : null}

          <div className="pointer-events-none absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-destructive shadow" />

          <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-background/85 px-2 py-1 text-xs">
            {!data && !error ? <Leaf className="size-3 animate-spin" /> : null}
            {error
              ? "Radar is not reachable right now."
              : frame
                ? frameLabel(frame)
                : "Loading radar..."}
          </div>
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="size-8"
              onClick={() => setZoom((v) => Math.min(MAX_ZOOM, v + 1))}
              aria-label="Zoom in"
            >
              +
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="size-8"
              onClick={() => setZoom((v) => Math.max(MIN_ZOOM, v - 1))}
              aria-label="Zoom out"
            >
              −
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Drag to pan</Badge>
          <Badge variant="outline">Scroll to zoom</Badge>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-6 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-destructive" />{" "}
            light to heavy rain
          </span>
          <span className="ml-auto">Radar by RainViewer, map by OpenStreetMap</span>
        </div>
      </CardContent>
    </Card>
  );
}
