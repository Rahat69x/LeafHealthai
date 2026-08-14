/** Small fetch helper: timeout, retry with backoff, and a short in-memory cache. */

interface Options {
  timeoutMs?: number;
  retries?: number;
  /** How long an identical URL may be served from memory. */
  cacheMs?: number;
  signal?: AbortSignal;
}

const memory = new Map<string, { at: number; value: unknown }>();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchJson<T>(url: string, options: Options = {}): Promise<T> {
  const { timeoutMs = 9000, retries = 2, cacheMs = 0, signal } = options;

  if (cacheMs > 0) {
    const hit = memory.get(url);
    if (hit && Date.now() - hit.at < cacheMs) return hit.value as T;
  }

  let lastError: unknown = new Error("request failed");
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`request failed with ${response.status}`);
      const value = (await response.json()) as T;
      if (cacheMs > 0) memory.set(url, { at: Date.now(), value });
      return value;
    } catch (error) {
      lastError = error;
      if (signal?.aborted) throw error;
      if (attempt < retries) await wait(400 * (attempt + 1));
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("request failed");
}
