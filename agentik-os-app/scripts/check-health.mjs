#!/usr/bin/env node
/**
 * Health check del entorno de desarrollo de Agentik O.S.
 * Imprime una tabla con:
 *   - Node / npm / python
 *   - ffmpeg (opcional en Fase 1, obligatorio en Fase 3)
 *   - vault path (existe?)
 *   - graphify importable?
 *
 * Salida NO falla el script — es informativo. Exit code 0 siempre
 * salvo error inesperado.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);
const IS_WIN = process.platform === 'win32';

/**
 * En Windows, los shims `node`/`npm` suelen ser `.cmd` y `execFile`
 * puede fallar con ENOENT o EINVAL según la versión de Node.
 * La solución portable: usar `shell: true` SOLO para shims .cmd.
 * Es un script de health check, no hay surface de inyección.
 */
async function execResolved(bin, args, opts = {}) {
  const finalOpts = { windowsHide: true, ...opts };
  if (IS_WIN && /\.(cmd|bat)$/i.test(bin)) {
    finalOpts.shell = true;
  }
  return await execFileP(bin, args, finalOpts);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, '..');
const vaultPath = process.env.AGENTIK_VAULT_PATH
  ? path.resolve(process.env.AGENTIK_VAULT_PATH)
  : path.resolve(monorepoRoot, '..', 'Agentik-OS-Vault');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GRAY = '\x1b[90m';
const BOLD = '\x1b[1m';

const rows = [];

async function check(label, fn) {
  try {
    const value = await fn();
    rows.push({ label, value, ok: true });
  } catch (err) {
    rows.push({ label, value: err.message ?? String(err), ok: false });
  }
}

function okMark(ok) {
  return ok ? `${GREEN}OK${RESET}` : `${RED}FAIL${RESET}`;
}

await check('node --version', async () => {
  const { stdout } = await execResolved(process.execPath, ['--version']);
  return stdout.trim();
});

await check('npm --version', async () => {
  // En Win, npm es un shim .cmd → necesitamos shell.
  const bin = IS_WIN ? 'npm.cmd' : 'npm';
  const { stdout } = await execResolved(bin, ['--version']);
  return stdout.trim();
});

await check('python --version', async () => {
  const { stdout, stderr } = await execResolved('python', ['--version']);
  return (stdout || stderr).trim();
});

await check('ffmpeg disponible', async () => {
  const bin = IS_WIN ? 'ffmpeg.exe' : 'ffmpeg';
  await execResolved(bin, ['-version'], { timeout: 5_000 });
  return 'instalado';
});

await check('vault path existe', async () => {
  if (!existsSync(vaultPath)) throw new Error(`no existe: ${vaultPath}`);
  const s = statSync(vaultPath);
  if (!s.isDirectory()) throw new Error(`no es directorio: ${vaultPath}`);
  return vaultPath;
});

await check('vault/01-IronMonkeyCharter/leads existe', async () => {
  const p = path.join(vaultPath, '01-IronMonkeyCharter', 'leads');
  if (!existsSync(p)) throw new Error(`no existe: ${p}`);
  return p;
});

await check('vault/03-Memoria/_logs existe', async () => {
  const p = path.join(vaultPath, '03-Memoria', '_logs');
  if (!existsSync(p)) throw new Error(`no existe: ${p}`);
  return p;
});

await check('graphify importable', async () => {
  const { stdout, stderr } = await execResolved(
    'python',
    ['-c', 'import graphify, sys; print(getattr(graphify, "__version__", "?"))'],
    { timeout: 10_000 },
  );
  const v = (stdout || stderr).trim();
  return v || 'sí';
});

const labelW = Math.max(...rows.map((r) => r.label.length));
console.log(`\n${BOLD}Agentik O.S. — health check${RESET}\n`);
for (const r of rows) {
  const padded = r.label.padEnd(labelW, ' ');
  const valueColor = r.ok ? GRAY : YELLOW;
  console.log(
    `  ${padded}  ${okMark(r.ok).padEnd(8, ' ')}  ${valueColor}${r.value}${RESET}`,
  );
}
console.log();
