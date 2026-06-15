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

import { VAULT_PATHS } from '../config/paths.js';
import { logger } from '../utils/logger.js';
import { execFileP } from '../utils/process-manager.js';
import { watch } from 'chokidar';

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

let lastRunTime = 0;
let runTimeout: ReturnType<typeof setTimeout> | null = null;
let activePromise: Promise<Result<ReindexResult>> | null = null;
let pendingAfterCurrent = false;

async function runReindex(): Promise<Result<ReindexResult>> {
  lastRunTime = Date.now();
  activePromise = (async () => {
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
    } finally {
      activePromise = null;
    }
  })();

  const result = await activePromise;

  // Si alguien pidio otra reindexacion mientras corria, lanzarla ahora
  if (pendingAfterCurrent) {
    pendingAfterCurrent = false;
    void reindex();
  }

  return result;
}

export async function reindex(): Promise<Result<ReindexResult>> {
  // Si ya hay una indexación en curso, marcamos que se necesita otra
  if (activePromise) {
    pendingAfterCurrent = true;
    return activePromise;
  }

  const now = Date.now();
  const timeSinceLastRun = now - lastRunTime;

  if (timeSinceLastRun < 30_000) {
    const delay = 30_000 - timeSinceLastRun;
    logger.info('graphify', `Reindex solicitado demasiado pronto. Debounce de ${Math.round(delay / 1000)}s`);

    if (runTimeout) clearTimeout(runTimeout);

    return new Promise((resolve, reject) => {
      runTimeout = setTimeout(() => {
        runTimeout = null;
        runReindex().then(resolve).catch(reject);
      }, delay);
    });
  }

  return runReindex();
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

let watcherStarted = false;

export function startWatcher(): void {
  if (watcherStarted) return;
  watcherStarted = true;

  const debounceMs = 5_000;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const watcher = watch(`${VAULT_PATHS.root}/**/*.md`, {
    ignored: /[\/\\]\./,
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', (path) => {
    logger.info('graphify', `vault change detected: ${path}`);
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      logger.info('graphify', 'debounced reindex starting');
      void reindex();
    }, debounceMs);
  });

  watcher.on('add', (path) => {
    logger.info('graphify', `vault add detected: ${path}`);
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      logger.info('graphify', 'debounced reindex starting');
      void reindex();
    }, debounceMs);
  });

  watcher.on('unlink', (path) => {
    logger.info('graphify', `vault unlink detected: ${path}`);
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      logger.info('graphify', 'debounced reindex starting');
      void reindex();
    }, debounceMs);
  });

  logger.info('graphify', `watcher started on ${VAULT_PATHS.root}`);
}
