/**
 * Rutas absolutas a los recursos del vault.
 * El vault vive como hermano de `agentik-os-app/`:
 *
 *   C:\Users\xisco\OneDrive\Escritorio\GERVASI\
 *   ├── Agentik-OS-Vault\
 *   └── agentik-os-app\
 *
 * Si esto cambia, basta editar VAULT_PATH o exportar la env var
 * AGENTIK_VAULT_PATH antes de arrancar el server.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(path.resolve(__dirname, '..', '..', '.env'));
  }
} catch {
  // Ignore if .env is missing or loadEnvFile is not supported
}


/**
 * Resuelve el path absoluto al vault.
 * Prioridad:
 *   1. process.env.AGENTIK_VAULT_PATH
 *   2. <raíz-del-monorepo>/../Agentik-OS-Vault (deducido desde este archivo)
 */
function resolveVaultPath(): string {
  if (process.env.AGENTIK_VAULT_PATH) {
    return path.resolve(process.env.AGENTIK_VAULT_PATH);
  }
  // __dirname = packages/server/src/config → 4 niveles arriba = monorepo root
  const monorepoRoot = path.resolve(__dirname, '..', '..', '..', '..');
  return path.resolve(monorepoRoot, '..', 'Agentik-OS-Vault');
}

export const VAULT_PATH = resolveVaultPath();

export const VAULT_PATHS = {
  root: VAULT_PATH,
  ironMonkey: path.join(VAULT_PATH, '01-IronMonkeyCharter'),
  ironMonkeyLeads: path.join(VAULT_PATH, '01-IronMonkeyCharter', 'leads'),
  ironMonkeyPropuestas: path.join(VAULT_PATH, '01-IronMonkeyCharter', 'propuestas'),
  growing: path.join(VAULT_PATH, '02-GrowingInmobiliario'),
  growingProspectos: path.join(VAULT_PATH, '02-GrowingInmobiliario', 'prospectos'),
  growingSesiones: path.join(VAULT_PATH, '02-GrowingInmobiliario', 'sesiones'),
  growingConversaciones: path.join(VAULT_PATH, '02-GrowingInmobiliario', 'conversaciones'),
  memoria: path.join(VAULT_PATH, '03-Memoria'),
  logs: path.join(VAULT_PATH, '03-Memoria', '_logs'),
  logFile: path.join(VAULT_PATH, '03-Memoria', '_logs', 'log.md'),
  graphifyOut: path.join(VAULT_PATH, 'graphify-out'),
} as const;

export const SERVER_PORT = Number(process.env.PORT ?? 3001);
