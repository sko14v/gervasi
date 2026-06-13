/**
 * Middleware Hono que loguea cada request:
 *   - a stdout con método, path, status, duración
 *   - a vault/03-Memoria/_logs/log.md con el mismo formato
 *
 * Se monta con `app.use('*', requestLogger())`.
 */

import type { MiddlewareHandler } from 'hono';
import { logger } from '../utils/logger.js';

export function requestLogger(): MiddlewareHandler {
  return async (c, next) => {
    const start = performance.now();
    const method = c.req.method;
    const url = new URL(c.req.url);
    const path = url.pathname;

    await next();

    const duration = Math.round(performance.now() - start);
    const status = c.res.status;
    const line = `[${method}] [${path}] [${status}] [${duration}ms]`;

    if (status >= 500) {
      logger.error('http', line);
    } else if (status >= 400) {
      logger.warn('http', line);
    } else {
      logger.info('http', line);
    }
  };
}
