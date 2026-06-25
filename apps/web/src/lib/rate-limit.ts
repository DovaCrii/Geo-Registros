/**
 * Simple in-memory sliding-window rate limiter.
 * Not suitable for multi-instance deployments — use Redis in production.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

/** Default: 30 requests per 60 seconds. */
const DEFAULT_LIMIT = 30;
const DEFAULT_WINDOW_MS = 60_000;

/**
 * Returns true if the request should be allowed.
 * Cleans up expired entries on each check.
 */
export function checkRateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  // Cleanup expired entries (heuristic: every 100 checks)
  if (store.size % 100 === 0) {
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k);
    }
  }

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Get reset time in seconds for the RateLimit-Reset header.
 */
export function getRateLimitReset(key: string): number {
  const entry = store.get(key);
  if (!entry) return 0;
  return Math.ceil((entry.resetAt - Date.now()) / 1000);
}
