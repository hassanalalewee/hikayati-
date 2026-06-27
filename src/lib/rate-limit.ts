/**
 * Simple in-memory rate limiter for MVP.
 * Sliding window counter per key. Resets automatically via TTL cleanup.
 *
 * For production scale: replace with Upstash Redis (see docs/22_TECHNICAL_ARCHITECTURE_v2.0.md).
 */

interface Window {
  count:     number
  resetAt:   number  // epoch ms
}

const store = new Map<string, Window>()

// Purge expired windows every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, window] of store.entries()) {
    if (now > window.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

export interface RateLimitResult {
  allowed:    boolean
  remaining:  number
  resetAt:    number
}

/**
 * Check and increment rate limit counter.
 * @param key       Unique key (e.g. "order:user-uuid")
 * @param limit     Max requests per window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now      = Date.now()
  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    // New or expired window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}
