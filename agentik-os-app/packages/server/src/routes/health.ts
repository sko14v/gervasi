/**
 * GET /health
 *
 * Devuelve un snapshot del estado del server:
 *   - status: 'ok' si el server arrancó
 *   - timestamp
 *   - vault_path: ruta absoluta al vault detectado
 *   - ffmpeg_available: si `ffmpeg -version` responde
 *   - graphify_available: si `python -c "import graphify"` funciona
 *
 * Si el vault o ffmpeg no están, NO es 500 — es 200 con flags
 * `*_available: false`. El frontend decide qué hacer.
 */

import { Hono } from 'hono';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { VAULT_PATH } from '../config/paths.js';
import * as graphify from '../services/graphify.service.js';

const execFileP = promisify(execFile);

async function checkFfmpeg(): Promise<boolean> {
  try {
    await execFileP('ffmpeg', ['-version'], { timeout: 5_000, windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

export const healthRouter = new Hono();

healthRouter.get('/', async (c) => {
  const [ffmpegOk, graphifyStatus] = await Promise.all([
    checkFfmpeg(),
    graphify.status(),
  ]);

  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    vault_path: VAULT_PATH,
    ffmpeg_available: ffmpegOk,
    graphify_available: graphifyStatus.ok,
    graphify_version:
      graphifyStatus.ok ? graphifyStatus.data.version : undefined,
  });
});
