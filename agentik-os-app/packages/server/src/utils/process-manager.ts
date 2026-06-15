/**
 * Registro de procesos hijos para shutdown graceful.
 *
 * Cualquier subprocess largo (ffmpeg, python, etc.) debe arrancar a través
 * de `execFile` o `execFileP` exportados desde aquí, para que SIGTERM/SIGINT
 * pueda terminar los procesos pendientes antes de cerrar el servidor.
 */

import {
  execFile as nodeExecFile,
  type ExecFileOptions,
  type ChildProcess,
} from 'node:child_process';
import { logger } from './logger.js';

const activeProcesses = new Set<ChildProcess>();

function register(child: ChildProcess, file: string): void {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  activeProcesses.add(child);
  child.on('exit', () => activeProcesses.delete(child));
  child.on('error', (err) => {
    logger.warn('process-manager', `${file} error: ${err.message}`);
    activeProcesses.delete(child);
  });
  // Si ya termino entre la creacion y el registro, limpiar
  if (child.exitCode !== null || child.signalCode !== null) {
    activeProcesses.delete(child);
  }
}

export function execFile(
  file: string,
  args?: readonly string[] | null | undefined,
  options?: ExecFileOptions | null | undefined,
  callback?: (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => void,
): ChildProcess {
  const child = nodeExecFile(file, args, options, callback);
  register(child, file);
  return child;
}

export function execFileP(
  file: string,
  args?: readonly string[] | null | undefined,
  options?: ExecFileOptions | null | undefined,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = nodeExecFile(
      file,
      args,
      options,
      (error, stdout, stderr) => {
        activeProcesses.delete(child);
        if (error) {
          reject(error);
        } else {
          resolve({ stdout: stdout as string, stderr: stderr as string });
        }
      },
    );
    register(child, file);
  });
}

export function killAllActiveProcesses(): void {
  for (const child of activeProcesses) {
    if (!child.killed && child.pid) {
      child.kill('SIGTERM');
    }
  }
  activeProcesses.clear();
}
