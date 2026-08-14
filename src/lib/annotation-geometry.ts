/**
 * Geometry helpers for image annotations.
 *
 * Every marker is stored in image-relative units (0-1 of the image width and
 * height) so it stays correct on any screen size, after a resize, or when the
 * photo is displayed at a different scale. These helpers guarantee a marker can
 * never sit, even partly, outside the image.
 */

export type NormBox = { x: number; y: number; w: number; h: number };
export type NormSpot = { x: number; y: number; r: number };

/** Minimum marker size, as a fraction of the image, so a box stays grabbable. */
export const MIN_BOX_SIZE = 0.02;

export function clamp01(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(0, parsed));
}

/** Keeps a box fully inside the image: 0 <= x, x + w <= 1 (same for y/h). */
export function clampBox(box: Partial<NormBox> | undefined): NormBox {
  const w = Math.min(1, Math.max(MIN_BOX_SIZE, clamp01(box?.w, MIN_BOX_SIZE)));
  const h = Math.min(1, Math.max(MIN_BOX_SIZE, clamp01(box?.h, MIN_BOX_SIZE)));
  const x = Math.min(1 - w, clamp01(box?.x, 0));
  const y = Math.min(1 - h, clamp01(box?.y, 0));
  return { x, y, w, h };
}

/** Moves a box by a delta while keeping every edge inside the image. */
export function moveBox(box: NormBox, dx: number, dy: number): NormBox {
  return clampBox({ ...box, x: box.x + dx, y: box.y + dy });
}

/** Resizes a box from one edge/corner, never letting it leave the image. */
export function resizeBox(
  box: NormBox,
  handle: { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean },
  dx: number,
  dy: number,
): NormBox {
  let { x, y, w, h } = box;
  if (handle.left) {
    const nextX = Math.min(Math.max(0, x + dx), x + w - MIN_BOX_SIZE);
    w += x - nextX;
    x = nextX;
  }
  if (handle.right) {
    w = Math.min(1 - x, Math.max(MIN_BOX_SIZE, w + dx));
  }
  if (handle.top) {
    const nextY = Math.min(Math.max(0, y + dy), y + h - MIN_BOX_SIZE);
    h += y - nextY;
    y = nextY;
  }
  if (handle.bottom) {
    h = Math.min(1 - y, Math.max(MIN_BOX_SIZE, h + dy));
  }
  return clampBox({ x, y, w, h });
}

/** Builds a clamped box from two drag points (both already 0-1). */
export function boxFromPoints(a: { x: number; y: number }, b: { x: number; y: number }): NormBox {
  const x = Math.min(clamp01(a.x), clamp01(b.x));
  const y = Math.min(clamp01(a.y), clamp01(b.y));
  const w = Math.abs(clamp01(b.x) - clamp01(a.x));
  const h = Math.abs(clamp01(b.y) - clamp01(a.y));
  return clampBox({ x, y, w, h });
}

/**
 * Keeps a round mark inside the image. The radius shrinks first so the circle
 * is never cropped by the image edge, then the centre is pinned in range.
 */
export function clampSpot(spot: Partial<NormSpot> | undefined): NormSpot {
  const x = clamp01(spot?.x, 0.5);
  const y = clamp01(spot?.y, 0.5);
  const maxR = Math.min(x, y, 1 - x, 1 - y, 0.5);
  const r = Math.min(Math.max(0.01, clamp01(spot?.r, 0.08)), Math.max(0.01, maxR));
  return { x, y, r };
}

/** Turns a pointer event into 0-1 image coordinates, or null if outside. */
export function pointerToNorm(
  event: { clientX: number; clientY: number },
  rect: DOMRect | null,
  { clampInside = true } = {},
): { x: number; y: number } | null {
  if (!rect || rect.width <= 0 || rect.height <= 0) return null;
  const rawX = (event.clientX - rect.left) / rect.width;
  const rawY = (event.clientY - rect.top) / rect.height;
  const inside = rawX >= 0 && rawX <= 1 && rawY >= 0 && rawY <= 1;
  if (!inside && !clampInside) return null;
  return { x: clamp01(rawX), y: clamp01(rawY) };
}

/** CSS box for a normalised marker, in percentages of the image. */
export function boxStyle(box: NormBox) {
  const safe = clampBox(box);
  return {
    left: `${safe.x * 100}%`,
    top: `${safe.y * 100}%`,
    width: `${safe.w * 100}%`,
    height: `${safe.h * 100}%`,
  } as const;
}

/** CSS box for a normalised round mark, in percentages of the image. */
export function spotStyle(spot: Partial<NormSpot>) {
  const safe = clampSpot(spot);
  return {
    left: `${(safe.x - safe.r) * 100}%`,
    top: `${(safe.y - safe.r) * 100}%`,
    width: `${safe.r * 200}%`,
    height: `${safe.r * 200}%`,
  } as const;
}
