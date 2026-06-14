/**
 * Ruta de Vault.
 *
 *   GET /vault/files → Obtiene la lista recursiva de archivos del vault (md/pdf)
 *   GET /vault/file  → Lee y devuelve el contenido de un archivo md del vault
 */

import { Hono } from 'hono';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { VAULT_PATHS, assertPathInside } from '../config/paths.js';

export const vaultRouter = new Hono();

interface VaultFile {
  path: string;
  name: string;
  dir: string;
  extension: string;
}

async function getFilesRecursively(dir: string, baseDir = dir): Promise<VaultFile[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: VaultFile[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Evitar carpetas ocultas y subdirectorios no operativos de audio o logs
      if (entry.name.startsWith('.') || entry.name === 'audio' || entry.name === '_logs') {
        continue;
      }
      files.push(...(await getFilesRecursively(fullPath, baseDir)));
    } else if (entry.isFile()) {
      // Solo archivos .md y .pdf
      if (entry.name.startsWith('.') || (!entry.name.endsWith('.md') && !entry.name.endsWith('.pdf'))) {
        continue;
      }
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const parts = relativePath.split('/');
      const dirName = parts.slice(0, -1).join('/');
      files.push({
        path: relativePath,
        name: entry.name,
        dir: dirName,
        extension: path.extname(entry.name),
      });
    }
  }
  return files;
}

vaultRouter.get('/files', async (c) => {
  try {
    const files = await getFilesRecursively(VAULT_PATHS.root);
    return c.json({ ok: true, files });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err), code: 500 }, 500);
  }
});

vaultRouter.get('/file', async (c) => {
  const relPath = c.req.query('path');
  if (!relPath) {
    return c.json({ error: 'Falta el parámetro path', code: 400 }, 400);
  }
  
  const absPath = path.resolve(VAULT_PATHS.root, relPath);
  try {
    assertPathInside(VAULT_PATHS.root, absPath);
    const content = await fs.readFile(absPath, 'utf8');
    return c.json({ ok: true, content });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err), code: 400 }, 400);
  }
});
