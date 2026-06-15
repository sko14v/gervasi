/**
 * Rate limiter in-memory simple para single-instance.
 * Límite: 1 request cada 5 minutos por IP + endpoint.
 */

import type { MiddlewareHandler } from 'hono';

const store = new Map<string, number>();
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos
let lastPruned = Date.now();

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  // Preferimos x-real-ip (proxy de confianza) y tomamos solo la primera IP de x-forwarded-for
  const realIp = c.req.header('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return 'unknown';
}

function pruneStore(): void {
  const now = Date.now();
  if (now - lastPruned < WINDOW_MS) return;
  const cutoff = now - WINDOW_MS;
  for (const [key, ts] of store.entries()) {
    if (ts < cutoff) store.delete(key);
  }
  lastPruned = now;
}

export function _resetRateLimiterStore(): void {
  store.clear();
  lastPruned = Date.now();
}

export function rateLimiter(): MiddlewareHandler {
  return async (c, next) => {
    pruneStore();
    const ip = getClientIp(c);
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
