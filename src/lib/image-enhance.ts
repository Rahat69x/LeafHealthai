/**
 * Makes a photo easier for the AI to read: white balance, auto brightness and
 * contrast, then a light noise clean-up. Everything runs in the browser on a
 * canvas, so nothing is uploaded twice.
 */

export interface EnhanceOptions {
  /** Longest side of the photo we send. Smaller = faster on slow internet. */
  maxSide?: number;
  quality?: number;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode"));
    image.src = src;
  });
}

/** Gray-world white balance: pulls a colour cast (shade, sunset) back to neutral. */
function whiteBalance(data: Uint8ClampedArray) {
  let r = 0;
  let g = 0;
  let b = 0;
  const pixels = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]!;
    g += data[i + 1]!;
    b += data[i + 2]!;
  }
  r /= pixels;
  g /= pixels;
  b /= pixels;
  const gray = (r + g + b) / 3;
  if (!gray) return;
  const kr = Math.min(1.3, Math.max(0.77, gray / (r || 1)));
  const kg = Math.min(1.3, Math.max(0.77, gray / (g || 1)));
  const kb = Math.min(1.3, Math.max(0.77, gray / (b || 1)));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i]! * kr;
    data[i + 1] = data[i + 1]! * kg;
    data[i + 2] = data[i + 2]! * kb;
  }
}

/** Stretches the histogram so dark and washed-out photos get usable contrast. */
function autoLevels(data: Uint8ClampedArray) {
  const histogram = new Array<number>(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const luma = (data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114) | 0;
    histogram[luma] = (histogram[luma] ?? 0) + 1;
  }
  const total = data.length / 4;
  const cut = total * 0.005;
  let low = 0;
  let high = 255;
  let seen = 0;
  for (let v = 0; v < 256; v++) {
    seen += histogram[v]!;
    if (seen > cut) {
      low = v;
      break;
    }
  }
  seen = 0;
  for (let v = 255; v >= 0; v--) {
    seen += histogram[v]!;
    if (seen > cut) {
      high = v;
      break;
    }
  }
  if (high - low < 24) return;
  const scale = 255 / (high - low);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (data[i]! - low) * scale;
    data[i + 1] = (data[i + 1]! - low) * scale;
    data[i + 2] = (data[i + 2]! - low) * scale;
  }
}

/** Very light 3x3 average, blended back, so grain goes but leaf edges stay. */
function denoise(data: Uint8ClampedArray, width: number, height: number, strength = 0.35) {
  const copy = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += copy[i + (dy * width + dx) * 4 + c]!;
          }
        }
        const mean = sum / 9;
        data[i + c] = copy[i + c]! * (1 - strength) + mean * strength;
      }
    }
  }
}

/**
 * Resizes and cleans up a photo before it is sent for analysis.
 * Returns the original data URL if anything fails, so a scan is never blocked.
 */
export async function enhancePhoto(dataUrl: string, options: EnhanceOptions = {}): Promise<string> {
  const maxSide = options.maxSide ?? 1024;
  const quality = options.quality ?? 0.82;
  try {
    const image = await loadImage(dataUrl);
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return dataUrl;
    ctx.drawImage(image, 0, 0, width, height);
    const frame = ctx.getImageData(0, 0, width, height);
    whiteBalance(frame.data);
    autoLevels(frame.data);
    if (width * height <= 1_600_000) denoise(frame.data, width, height);
    ctx.putImageData(frame, 0, 0);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return dataUrl;
  }
}
