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
import { VAULT_PATH } from '../config/paths.js';
import * as graphify from '../services/graphify.service.js';
import { execFileP } from '../utils/process-manager.js';

let _ffmpegCached: { ok: boolean; ts: number } | null = null;
const FFMPEG_CACHE_TTL_MS = 60_000;

async function checkFfmpeg(): Promise<boolean> {
  const now = Date.now();
  if (_ffmpegCached && now - _ffmpegCached.ts < FFMPEG_CACHE_TTL_MS) {
    return _ffmpegCached.ok;
  }
  try {
    await execFileP('ffmpeg', ['-version'], { timeout: 5_000, windowsHide: true });
    _ffmpegCached = { ok: true, ts: now };
    return true;
  } catch {
    _ffmpegCached = { ok: false, ts: now };
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
