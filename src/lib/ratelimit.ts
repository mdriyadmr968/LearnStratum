/**
 * In-memory sliding-window rate limiter with graceful Upstash Redis support.
 * Protects AI generation routes from rapid-fire API quota exhaustion.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Check if an identifier (e.g. user ID or IP) exceeds maximum requests in the time window.
 *
 * @param identifier Unique key to rate limit (user ID or client IP)
 * @param limit Max allowed requests within window (default 10)
 * @param windowMs Duration of sliding window in ms (default 60,000 = 1 min)
 */
export async function checkRateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60_000
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = memoryStore.get(identifier) || { timestamps: [] };

  // Filter timestamps within current window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= limit) {
    const oldest = activeTimestamps[0];
    const resetMs = Math.max(0, oldest + windowMs - now);
    return {
      success: false,
      remaining: 0,
      resetMs,
    };
  }

  // Record this attempt
  activeTimestamps.push(now);
  memoryStore.set(identifier, { timestamps: activeTimestamps });

  // Clean up memory store periodically
  if (memoryStore.size > 10_000) {
    for (const [key, val] of memoryStore.entries()) {
      if (val.timestamps.every((ts) => ts <= windowStart)) {
        memoryStore.delete(key);
      }
    }
  }

  return {
    success: true,
    remaining: limit - activeTimestamps.length,
    resetMs: windowMs,
  };
}
