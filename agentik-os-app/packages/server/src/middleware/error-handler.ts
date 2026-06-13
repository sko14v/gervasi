/**
 * Captura cualquier excepción no manejada en la cadena de Hono y
 * la convierte en un JSON `{ error, code }` con status code coherente.
 * Nunca deja que el server crashee.
 */

import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    logger.warn('error', `[${err.status}] ${err.message}`);
    return c.json({ error: err.message, code: err.status }, err.status);
  }

  const message = err instanceof Error ? err.message : String(err);
  logger.error('error', '[500] unhandled', err);
  return c.json({ error: message, code: 500 }, 500);
};
