/**
 * Logger minimalista:
 *   - escribe a stdout (con color/component si lo configuras luego)
 *   - append a vault/03-Memoria/_logs/log.md con formato
 *     [YYYY-MM-DD HH:MM:SS] [LEVEL] [tag] mensaje
 *
 * En Fase 2 podemos enriquecer con request-id, correlación SSE, etc.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { VAULT_PATHS } from '../config/paths.js';

const LEVELS = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
} as const;

export type LogLevel = keyof typeof LEVELS;

function ts(): string {
  const d = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

async function appendToVaultFile(line: string): Promise<void> {
  try {
    await fs.mkdir(path.dirname(VAULT_PATHS.logFile), { recursive: true });
    await fs.appendFile(VAULT_PATHS.logFile, line + '\n', 'utf8');
  } catch (err) {
    // Si el vault no está accesible, el log a stdout sigue funcionando.
    // No queremos que un error de I/O tumbe el server.
    // eslint-disable-next-line no-console
    console.error('[logger] no se pudo escribir en log.md:', err);
  }
}

function format(level: LogLevel, tag: string, msg: string): string {
  return `[${ts()}] [${LEVELS[level]}] [${tag}] ${msg}`;
}

export const logger = {
  info(tag: string, msg: string): void {
    const line = format('info', tag, msg);
    // eslint-disable-next-line no-console
    console.log(line);
    void appendToVaultFile(line);
  },
  warn(tag: string, msg: string, err?: unknown): void {
    const tail = err instanceof Error ? ` | ${err.message}` : '';
    const line = format('warn', tag, msg + tail);
    // eslint-disable-next-line no-console
    console.warn(line);
    void appendToVaultFile(line);
  },
  error(tag: string, msg: string, err?: unknown): void {
    const tail = err instanceof Error ? ` | ${err.message}` : '';
    const line = format('error', tag, msg + tail);
    // eslint-disable-next-line no-console
    console.error(line);
    void appendToVaultFile(line);
  },
  debug(tag: string, msg: string): void {
    if (process.env.DEBUG !== '1') return;
    const line = format('debug', tag, msg);
    // eslint-disable-next-line no-console
    console.log(line);
  },
};
