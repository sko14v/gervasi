#!/usr/bin/env node
/**
 * Rebuild manual del grafo de Graphify.
 * Equivalente a `python -m graphify update <vault>` pero con el
 * path resuelto a la ubicación real del vault.
 *
 * Uso:
 *   node scripts/index-graphify.mjs
 *   node scripts/index-graphify.mjs --no-cluster
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, '..');
const vaultPath = process.env.AGENTIK_VAULT_PATH
  ? path.resolve(process.env.AGENTIK_VAULT_PATH)
  : path.resolve(monorepoRoot, '..', 'Agentik-OS-Vault');

if (!existsSync(vaultPath)) {
  console.error(`[index-graphify] ERROR: vault no encontrado en ${vaultPath}`);
  process.exit(1);
}

const extraArgs = process.argv.slice(2);
console.log(`[index-graphify] vault: ${vaultPath}`);
console.log(`[index-graphify] ejecutando: python -m graphify update <vault> ${extraArgs.join(' ')}`);

try {
  const { stdout, stderr } = await execFileP(
    'python',
    ['-m', 'graphify', 'update', vaultPath, ...extraArgs],
    { timeout: 10 * 60 * 1000, maxBuffer: 32 * 1024 * 1024, windowsHide: true },
  );
  process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  console.log('[index-graphify] OK');
} catch (err) {
  console.error(`[index-graphify] FAIL: ${err.message}`);
  process.exit(2);
}
