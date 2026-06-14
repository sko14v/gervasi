/**
 * Rate limiter in-memory simple para single-instance.
 * Límite: 1 request cada 5 minutos por IP + endpoint.
 */

import type { MiddlewareHandler } from 'hono';

const store = new Map<string, number>();
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos

export function _resetRateLimiterStore(): void {
  store.clear();
}

export function rateLimiter(): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const path = c.req.path;
    const key = `${ip}:${path}`;
    const now = Date.now();
    const last = store.get(key);

    if (last && now - last < WINDOW_MS) {
      const retryAfter = Math.ceil((WINDOW_MS - (now - last)) / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json(
        { error: 'Rate limit exceeded. Max 1 analysis every 5 minutes.', code: 429 },
        429,
      );
    }

    store.set(key, now);
    await next();
  };
}
