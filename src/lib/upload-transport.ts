/**
 * Makes the photo small before it is sent. On a slow connection we send an even
 * smaller photo so the check still finishes.
 */
export interface UploadPlan {
  maxSide: number;
  quality: number;
  slow: boolean;
}

type NetworkInfo = { effectiveType?: string; downlink?: number; saveData?: boolean };

export function connectionPlan(): UploadPlan {
  const net = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  const type = net?.effectiveType ?? "";
  const slow =
    Boolean(net?.saveData) ||
    type === "slow-2g" ||
    type === "2g" ||
    type === "3g" ||
    (net?.downlink ?? 10) < 1.2;
  if (slow) return { maxSide: 640, quality: 0.62, slow: true };
  return { maxSide: 1024, quality: 0.8, slow: false };
}

/** Re-draws a data URL photo at a smaller size. Returns the original if anything fails. */
export async function compressDataUrl(
  dataUrl: string,
  plan: UploadPlan = connectionPlan(),
): Promise<string> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("decode"));
      element.src = dataUrl;
    });
    const scale = Math.min(1, plan.maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = canvas.toDataURL("image/jpeg", plan.quality);
    return out.length < dataUrl.length ? out : dataUrl;
  } catch {
    return dataUrl;
  }
}

export function approxKb(dataUrl: string) {
  return Math.max(1, Math.round((dataUrl.length * 0.75) / 1024));
}

/** Runs a job again if the connection drops. Never retries a real refusal. */
export async function withRetry<T>(
  job: () => Promise<T>,
  onAttempt?: (attempt: number) => void,
  tries = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      onAttempt?.(attempt);
      return await job();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "";
      const permanent = /too big|required|credits|not supported/i.test(message);
      if (permanent || attempt === tries || !navigator.onLine) break;
      await new Promise((resolve) => window.setTimeout(resolve, attempt * 1200));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("The check did not finish. Please try again.");
}
