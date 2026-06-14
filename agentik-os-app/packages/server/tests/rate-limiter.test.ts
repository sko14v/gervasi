import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { rateLimiter, _resetRateLimiterStore } from '../src/middleware/rate-limiter.js';

async function simulatePost(app: Hono, path = '/test', headers?: Record<string, string>) {
  const req = new Request(`http://localhost${path}`, { method: 'POST', headers });
  return app.fetch(req);
}

describe('rateLimiter', () => {
  beforeEach(() => {
    _resetRateLimiterStore();
  });
  it('allows first request', async () => {
    const app = new Hono();
    app.use('/test', rateLimiter());
    app.post('/test', (c) => c.json({ ok: true }));

    const res = await simulatePost(app, '/test');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('blocks second request within 5min', async () => {
    const app = new Hono();
    app.use('/test', rateLimiter());
    app.post('/test', (c) => c.json({ ok: true }));

    const res1 = await simulatePost(app, '/test');
    expect(res1.status).toBe(200);

    const res2 = await simulatePost(app, '/test');
    expect(res2.status).toBe(429);
    const body = await res2.json();
    expect(body.code).toBe(429);
    expect(res2.headers.get('Retry-After')).toBeTruthy();
  });

  it('different paths have separate limits', async () => {
    const app = new Hono();
    app.use('/a', rateLimiter());
    app.use('/b', rateLimiter());
    app.post('/a', (c) => c.json({ ok: true }));
    app.post('/b', (c) => c.json({ ok: true }));

    const resA = await simulatePost(app, '/a');
    const resB = await simulatePost(app, '/b');
    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);
  });
});
