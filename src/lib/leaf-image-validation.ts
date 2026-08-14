export type QualityGrade = "Excellent" | "Good" | "Fair" | "Poor";

export interface ImageMetrics {
  width: number;
  height: number;
  brightness: number;
  sharpness: number;
  leafCover: number;
  blobs: number;
  colorMix: number;
  /** Spread of light and dark in the photo. Low means a flat, washed out photo. */
  contrast: number;
  /** Rough grain level. High means a noisy night photo. */
  noise: number;
  /** Share of very dark pixels - a sign of shadow. */
  shadowShare: number;
  /** Share of burnt out white pixels - a sign of glare or flash reflection. */
  glareShare: number;
  /** How busy the area around the leaf looks. */
  background: number;
  /** How much of the leaf touches the photo edge. */
  edgeTouch: number;
  orientation: "Portrait" | "Landscape" | "Square";
}

/** One item in the photo quality checklist shown to the user. */
export interface QualityItem {
  /** Plain label, e.g. "Lighting". */
  label: string;
  state: "pass" | "warn" | "fail";
  /** Short plain answer for this check. */
  detail: string;
  /** What to do when this check is not a pass. */
  tip?: string;
}

export interface ImageCheck {
  ok: boolean;
  grade: QualityGrade;
  score: number;
  problems: string[];
  reason: string | null;
  preview: string;
  original: string;
  cropped: boolean;
  metrics: ImageMetrics;
  fileName: string;
  /** Full checklist from the photo quality assistant. */
  items: QualityItem[];
  /** Short, specific things the user can do to get a better photo. */
  suggestions: string[];
}

export type InspectResult =
  { status: "ready"; check: ImageCheck } | { status: "rejected"; message: string; help?: string[] };

/** A photo below this score is never sent for analysis. */
export const MIN_ANALYSIS_SCORE = 55;

/** True when the photo is good enough to analyse. */
export function canAnalyse(check: ImageCheck | null): check is ImageCheck {
  return Boolean(check && check.ok && !check.reason && check.score >= MIN_ANALYSIS_SCORE);
}

export const MAX_FILE_MB = 15;

export const ACCEPTED_TYPES = ["JPG", "JPEG", "PNG", "WEBP", "HEIC", "BMP", "TIFF", "GIF"];

const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif|bmp|tiff?|gif|avif)$/i;
const BAD_EXT =
  /\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?|mp4|mov|avi|mkv|mp3|wav|exe|dmg|apk|txt|csv|json|svg)$/i;

const WORK = 224;

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode-failed"));
    img.src = url;
  });
}

function isLeafPixel(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const green = g > b + 10 && g >= r - 15 && sat > 0.12;
  const warm = r > b + 30 && g > b + 15 && r < 240 && sat > 0.18;
  return green || warm;
}

/** Count separate leaf-like areas, ignoring specks. */
function countBlobs(mask: Uint8Array, size: number) {
  const seen = new Uint8Array(mask.length);
  const stack: number[] = [];
  let big = 0;
  const minArea = mask.length * 0.02;
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    let area = 0;
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop() as number;
      area++;
      const x = i % size;
      const y = (i / size) | 0;
      if (x > 0 && mask[i - 1] && !seen[i - 1]) {
        seen[i - 1] = 1;
        stack.push(i - 1);
      }
      if (x < size - 1 && mask[i + 1] && !seen[i + 1]) {
        seen[i + 1] = 1;
        stack.push(i + 1);
      }
      if (y > 0 && mask[i - size] && !seen[i - size]) {
        seen[i - size] = 1;
        stack.push(i - size);
      }
      if (y < size - 1 && mask[i + size] && !seen[i + size]) {
        seen[i + size] = 1;
        stack.push(i + size);
      }
    }
    if (area > minArea) big++;
  }
  return big;
}

function toDataUrl(img: HTMLImageElement, box?: { x: number; y: number; w: number; h: number }) {
  const src = box ?? { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(src.w, src.h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(src.w * scale));
  canvas.height = Math.max(1, Math.round(src.h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, src.x, src.y, src.w, src.h, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

/** Turns the raw numbers into a plain checklist a farmer can act on. */
function buildChecklist(m: ImageMetrics, file: File): QualityItem[] {
  const items: QualityItem[] = [];
  const add = (label: string, state: QualityItem["state"], detail: string, tip?: string) =>
    items.push(tip ? { label, state, detail, tip } : { label, state, detail });

  const type = (file.type || "image").split("/")[1]?.toUpperCase() ?? "IMAGE";
  add("File type", "pass", `${type} photo accepted`);

  const side = Math.min(m.width, m.height);
  add(
    "Photo size",
    side >= 700 ? "pass" : side >= 400 ? "warn" : "fail",
    `${m.width} x ${m.height} pixels`,
    side < 700 ? "Use your normal camera photo instead of a small or screenshot image." : undefined,
  );

  add(
    "Sharpness",
    m.sharpness >= 90 ? "pass" : m.sharpness >= 45 ? "warn" : "fail",
    m.sharpness >= 90 ? "The leaf edges look sharp" : "The photo looks soft",
    m.sharpness < 90
      ? "Hold the camera steady and tap the screen on the leaf before you take the photo."
      : undefined,
  );

  add(
    "Lighting",
    m.brightness >= 80 && m.brightness <= 195
      ? "pass"
      : m.brightness >= 55 && m.brightness <= 215
        ? "warn"
        : "fail",
    m.brightness < 80
      ? "The photo is dark"
      : m.brightness > 195
        ? "The photo is very bright"
        : "Good daylight",
    m.brightness < 80
      ? "Move into soft daylight or add more light."
      : m.brightness > 195
        ? "Turn off the flash and step out of direct sun."
        : undefined,
  );

  add(
    "Contrast",
    m.contrast >= 35 ? "pass" : m.contrast >= 22 ? "warn" : "fail",
    m.contrast >= 35 ? "Marks stand out from the leaf" : "The photo looks flat",
    m.contrast < 35 ? "Take the photo against a plain background in even light." : undefined,
  );

  add(
    "Grain",
    m.noise < 0.5 ? "pass" : m.noise < 0.75 ? "warn" : "fail",
    m.noise < 0.5 ? "Clean photo" : "The photo looks grainy",
    m.noise >= 0.5 ? "Take the photo in daylight instead of low light or night mode." : undefined,
  );

  add(
    "Leaf in frame",
    m.leafCover >= 0.3 ? "pass" : m.leafCover >= 0.16 ? "warn" : "fail",
    `The leaf fills about ${Math.round(m.leafCover * 100)}% of the photo`,
    m.leafCover < 0.3 ? "Move closer so the leaf fills most of the frame." : undefined,
  );

  add(
    "Leaves found",
    "pass",
    m.blobs <= 1 ? "One leaf found" : `${m.blobs} leaves found - all of them will be checked`,
    undefined,
  );

  add(
    "Whole leaf visible",
    m.edgeTouch < 0.5 ? "pass" : m.edgeTouch < 0.75 ? "warn" : "fail",
    m.edgeTouch < 0.5 ? "The leaf fits inside the photo" : "The leaf touches the photo edge",
    m.edgeTouch >= 0.5 ? "Step back a little so the whole leaf fits inside the frame." : undefined,
  );

  add(
    "Shadows",
    m.shadowShare < 0.12 ? "pass" : m.shadowShare < 0.25 ? "warn" : "fail",
    m.shadowShare < 0.12 ? "No strong shadow" : "A dark shadow covers part of the photo",
    m.shadowShare >= 0.12 ? "Turn so your own shadow does not fall on the leaf." : undefined,
  );

  add(
    "Glare",
    m.glareShare < 0.03 ? "pass" : m.glareShare < 0.08 ? "warn" : "fail",
    m.glareShare < 0.03 ? "No shiny spots" : "Bright white glare on the leaf",
    m.glareShare >= 0.03 ? "Avoid flash and direct sun on wet leaves." : undefined,
  );

  add(
    "Background",
    m.background < 0.28 ? "pass" : m.background < 0.42 ? "warn" : "fail",
    m.background < 0.28 ? "Simple background" : "The background is busy",
    m.background >= 0.28 ? "Hold the leaf over plain ground, paper or your hand." : undefined,
  );

  add("Orientation", "pass", `${m.orientation} photo`);

  return items;
}

function grade(score: number): QualityGrade {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

/** Checks the photo on the device before any analysis runs. */
export async function inspectImage(file: File): Promise<InspectResult> {
  const looksLikeImage = file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
  if (!looksLikeImage || BAD_EXT.test(file.name)) {
    return {
      status: "rejected",
      message: "Please upload an image file.",
      help: [
        `We accept ${ACCEPTED_TYPES.join(", ")} and other normal photo files.`,
        "Take a photo of one leaf with your phone camera.",
      ],
    };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return {
      status: "rejected",
      message: `This file is too big. Please upload a photo under ${MAX_FILE_MB} MB.`,
      help: ["Use your normal camera photo instead of a very large file."],
    };
  }

  const url = URL.createObjectURL(file);
  let img: HTMLImageElement;
  try {
    img = await loadImage(url);
  } catch {
    URL.revokeObjectURL(url);
    return {
      status: "rejected",
      message: "We could not open this file. Please upload a clear photo.",
    };
  }
  URL.revokeObjectURL(url);

  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = WORK;
  canvas.height = WORK;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx)
    return { status: "rejected", message: "We could not read this photo. Please try again." };
  ctx.drawImage(img, 0, 0, WORK, WORK);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, WORK, WORK).data;
  } catch {
    return { status: "rejected", message: "We could not read this photo. Please try again." };
  }

  const total = WORK * WORK;
  const gray = new Float32Array(total);
  const mask = new Uint8Array(total);
  let brightSum = 0;
  let braySq = 0;
  let satSum = 0;
  let leafPixels = 0;
  let darkPixels = 0;
  let glarePixels = 0;
  let bgSatSum = 0;
  let bgPixels = 0;
  let minX = WORK,
    minY = WORK,
    maxX = 0,
    maxY = 0;

  for (let i = 0; i < total; i++) {
    const r = data[i * 4] ?? 0;
    const g = data[i * 4 + 1] ?? 0;
    const b = data[i * 4 + 2] ?? 0;
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    const lum = gray[i] as number;
    brightSum += lum;
    braySq += lum * lum;
    if (lum < 35) darkPixels++;
    if (lum > 245) glarePixels++;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    satSum += sat;
    if (isLeafPixel(r, g, b)) {
      mask[i] = 1;
      leafPixels++;
      const x = i % WORK;
      const y = (i / WORK) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    } else {
      bgSatSum += sat;
      bgPixels++;
    }
  }

  let lapSum = 0;
  let lapSq = 0;
  let lapAbs = 0;
  let count = 0;
  for (let y = 1; y < WORK - 1; y++) {
    for (let x = 1; x < WORK - 1; x++) {
      const i = y * WORK + x;
      const lap =
        4 * (gray[i] ?? 0) -
        (gray[i - 1] ?? 0) -
        (gray[i + 1] ?? 0) -
        (gray[i - WORK] ?? 0) -
        (gray[i + WORK] ?? 0);
      lapSum += lap;
      lapSq += lap * lap;
      lapAbs += Math.abs(lap);
      count++;
    }
  }
  const lapMean = lapSum / count;
  const sharpness = lapSq / count - lapMean * lapMean;

  const brightness = brightSum / total;
  const contrast = Math.sqrt(Math.max(0, braySq / total - brightness * brightness));
  const colorMix = satSum / total;
  const leafCover = leafPixels / total;
  const blobs = leafCover > 0.05 ? countBlobs(mask, WORK) : 0;
  const shadowShare = darkPixels / total;
  const glareShare = glarePixels / total;
  const background = bgPixels ? bgSatSum / bgPixels : 0;
  // Grain: lots of small edges everywhere but little real structure.
  const noise = Math.max(
    0,
    Math.min(1, lapAbs / count / Math.max(6, Math.sqrt(Math.max(sharpness, 1)))),
  );
  const orientation: ImageMetrics["orientation"] =
    width > height * 1.1 ? "Landscape" : height > width * 1.1 ? "Portrait" : "Square";

  // How much of the leaf touches the photo edge - a sign the leaf is cut off.
  let edgeHits = 0;
  for (let x = 0; x < WORK; x++) {
    if (mask[x]) edgeHits++;
    if (mask[(WORK - 1) * WORK + x]) edgeHits++;
  }
  for (let y = 0; y < WORK; y++) {
    if (mask[y * WORK]) edgeHits++;
    if (mask[y * WORK + WORK - 1]) edgeHits++;
  }
  const edgeTouch = edgeHits / (WORK * 4);

  const metrics: ImageMetrics = {
    width,
    height,
    brightness,
    sharpness,
    leafCover,
    blobs,
    colorMix,
    contrast,
    noise,
    shadowShare,
    glareShare,
    background,
    edgeTouch,
    orientation,
  };

  let reason: string | null = null;

  if (width < 200 || height < 200) {
    reason = "This photo is too small to check. Use your phone camera and move closer to one leaf.";
  } else if (colorMix < 0.06 || leafCover < 0.08) {
    reason = "We need a photo of plant leaves. Point the camera at the plant you want to check.";
  } else if (leafCover < 0.14) {
    reason = "The leaf is too far away. Move closer, but keep the whole leaf in the photo.";
  } else if (brightness < 45) {
    reason = "The photo is too dark. Take it outside or in soft daylight without a shadow.";
  } else if (brightness > 215) {
    reason = "The photo is too bright. Move out of direct sun and turn off the flash.";
  } else if (sharpness < 25) {
    reason = "The photo is blurry. Hold the phone still, tap the leaf, and take it again.";
  }

  const items = buildChecklist(metrics, file);
  const problems = items
    .filter((item) => item.state !== "pass")
    .map((item) => item.tip ?? item.detail);

  const sharpScore = Math.min(1, sharpness / 220);
  const lightScore = 1 - Math.min(1, Math.abs(brightness - 130) / 95);
  const coverScore = Math.min(1, leafCover / 0.45);
  const resScore = Math.min(1, Math.min(width, height) / 720);
  const cleanScore =
    1 -
    Math.min(1, shadowShare / 0.22) * 0.35 -
    Math.min(1, glareShare / 0.08) * 0.35 -
    Math.min(1, Math.max(0, noise - 0.5) / 0.5) * 0.3;
  let score = Math.round(
    sharpScore * 28 +
      lightScore * 22 +
      coverScore * 20 +
      resScore * 14 +
      Math.max(0, cleanScore) * 16,
  );

  if (contrast < 22) score -= 8;
  if (reason) score = Math.min(score, 35);
  score = Math.max(5, Math.min(100, score));

  let box: { x: number; y: number; w: number; h: number } | undefined;
  let cropped = false;
  if (!reason && maxX > minX && maxY > minY) {
    const pad = 0.08;
    const sx = width / WORK;
    const sy = height / WORK;
    const bw = (maxX - minX + 1) * sx;
    const bh = (maxY - minY + 1) * sy;
    const px = bw * pad;
    const py = bh * pad;
    const x = Math.max(0, minX * sx - px);
    const y = Math.max(0, minY * sy - py);
    const w = Math.min(width - x, bw + px * 2);
    const h = Math.min(height - y, bh + py * 2);
    if (w > width * 0.2 && h > height * 0.2 && (w < width * 0.95 || h < height * 0.95)) {
      box = { x, y, w, h };
      cropped = true;
    }
  }

  const original = toDataUrl(img);
  const preview = box ? toDataUrl(img, box) : original;

  return {
    status: "ready",
    check: {
      ok: !reason,
      grade: grade(score),
      score,
      problems,
      items,
      suggestions: items
        .filter((item) => item.state !== "pass" && item.tip)
        .map((item) => item.tip as string),
      reason,
      preview: preview || original,
      original,
      cropped,
      metrics,
      fileName: file.name,
    },
  };
}
