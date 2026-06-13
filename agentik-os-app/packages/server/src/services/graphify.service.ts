/**
 * Wrapper subprocess de `python -m graphify`.
 *
 * Comandos que usamos:
 *   - status()       → `python -c "import graphify"` (sanity)
 *   - reindex()      → `python -m graphify update <vault>` (rebuild rápido)
 *   - query(q)       → `python -m graphify query "<q>"` (BFS por pregunta)
 *
 * Si graphify no responde (timeout, no instalado, error interno),
 * las funciones devuelven `{ ok: false, error }` y nunca crashean
 * el server. El caller decide qué hacer (mostrar alerta, fallback, etc.).
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { VAULT_PATHS } from '../config/paths.js';
import { logger } from '../utils/logger.js';

const execFileP = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 30_000;

type Result<T> =
  | { ok: true; data: T; duration_ms: number }
  | { ok: false; error: string; duration_ms: number };

async function run(
  args: string[],
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ stdout: string; stderr: string; duration_ms: number }> {
  const start = performance.now();
  try {
    const { stdout, stderr } = await execFileP('python', args, {
      timeout: timeoutMs,
      maxBuffer: 16 * 1024 * 1024,
      windowsHide: true,
      cwd: VAULT_PATHS.root,
    });
    return { stdout, stderr, duration_ms: Math.round(performance.now() - start) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`graphify exec failed: ${message}`);
  }
}

export async function status(): Promise<Result<{ available: boolean; version?: string }>> {
  const start = performance.now();
  try {
    const { stdout, duration_ms } = await run(
      ['-c', 'import graphify, sys; print(getattr(graphify, "__version__", "unknown"))'],
      10_000,
    );
    return {
      ok: true,
      data: { available: true, version: stdout.trim() },
      duration_ms,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Math.round(performance.now() - start),
    };
  }
}

export interface ReindexResult {
  vault_path: string;
  stdout: string;
  stderr: string;
}

export async function reindex(): Promise<Result<ReindexResult>> {
  const start = performance.now();
  try {
    logger.info('graphify', `reindex → ${VAULT_PATHS.root}`);
    const { stdout, stderr, duration_ms } = await run(
      ['-m', 'graphify', 'update', VAULT_PATHS.root, '--no-cluster', '--force'],
      120_000, // el reindex puede tardar más que el resto
    );
    return {
      ok: true,
      data: { vault_path: VAULT_PATHS.root, stdout, stderr },
      duration_ms,
    };
  } catch (err) {
    logger.error('graphify', 'reindex failed', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Math.round(performance.now() - start),
    };
  }
}

export async function query(question: string): Promise<Result<{ answer: string }>> {
  const start = performance.now();
  if (!question.trim()) {
    return { ok: false, error: 'empty query', duration_ms: 0 };
  }
  try {
    const { stdout, duration_ms } = await run(
      ['-m', 'graphify', 'query', question, '--budget', '2000'],
    );
    return { ok: true, data: { answer: stdout.trim() }, duration_ms };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Math.round(performance.now() - start),
    };
  }
}
