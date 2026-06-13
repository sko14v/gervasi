#!/usr/bin/env node
/**
 * seed-leads.mjs
 *
 * Seeds 4 example leads into the vault.
 * Avoids non-ASCII characters in names because of a known OneDrive +
 * Windows PowerShell encoding round-trip issue.
 *
 * Run: node packages/app/scripts/seed-leads.mjs
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  'Agentik-OS-Vault',
);
const LEADS_DIR = path.join(VAULT_PATH, '01-IronMonkeyCharter', 'leads');

const SEED_LEADS = [
  {
    id: 'IM-2026-001',
    body: '# Lead: Maria Garcia\n\n## Notas\n- Day Charter para 10 personas\n- Celebracion familiar (cumpleanos)\n- Presupuesto entre 3K y 4.5K\n- Quiere catering incluido\n',
    data: {
      id: 'IM-2026-001',
      nombre: 'Maria Garcia',
      telefono: '+34 600 000 001',
      email: 'maria@example.com',
      idioma: 'ES',
      origen: 'facebook',
      estado: 'cualificado',
      score: 8,
      sensacion: 'caliente',
      fecha_evento: '2026-07-15',
      personas: 10,
      tipo_evento: 'Day Charter - cumpleanos',
      presupuesto_min: 3000,
      presupuesto_max: 4500,
      servicios_mencionados: ['catering', 'musica'],
      created_at: '2026-06-10T10:00:00Z',
      updated_at: '2026-06-12T14:30:00Z',
    },
  },
  {
    id: 'IM-2026-002',
    body: '# Lead: Carlos Ruiz\n\n## Notas\n- Empresa tecnologica, team building\n- 25 personas, dia completo\n- Presupuesto abierto\n',
    data: {
      id: 'IM-2026-002',
      nombre: 'Carlos Ruiz',
      telefono: '+34 600 000 002',
      email: 'carlos@techco.example',
      idioma: 'ES',
      origen: 'referido',
      estado: 'propuesta_enviada',
      score: 7,
      sensacion: 'caliente',
      fecha_evento: '2026-08-22',
      personas: 25,
      tipo_evento: 'Team building',
      presupuesto_min: 6000,
      presupuesto_max: 8000,
      servicios_mencionados: ['barra libre', 'musica', 'catering'],
      created_at: '2026-05-28T09:00:00Z',
      updated_at: '2026-06-11T16:00:00Z',
    },
  },
  {
    id: 'IM-2026-003',
    body: '# Lead: Ana Lopez\n\n## Notas\n- Boda pequena, 30 personas, sunset\n- Acepto el borrador pero lleva 6 dias sin confirmar\n',
    data: {
      id: 'IM-2026-003',
      nombre: 'Ana Lopez',
      telefono: '+34 600 000 003',
      email: 'ana@example.com',
      idioma: 'ES',
      origen: 'web',
      estado: 'en_negociacion',
      score: 9,
      sensacion: 'caliente',
      fecha_evento: '2026-09-05',
      personas: 30,
      tipo_evento: 'Boda sunset',
      presupuesto_min: 8000,
      presupuesto_max: 12000,
      servicios_mencionados: ['catering premium', 'musica en vivo', 'barra libre'],
      created_at: '2026-05-10T12:00:00Z',
      updated_at: '2026-06-06T18:00:00Z',
    },
  },
  {
    id: 'IM-2026-004',
    body: '# Lead: Jordi Pons\n\n## Notas\n- Contactado por Facebook el lunes\n- Pidio info general, sin urgencia\n',
    data: {
      id: 'IM-2026-004',
      nombre: 'Jordi Pons',
      telefono: '+34 600 000 004',
      email: 'jordi@example.com',
      idioma: 'CAT',
      origen: 'facebook',
      estado: 'nuevo',
      score: 4,
      sensacion: 'tibio',
      created_at: '2026-06-12T08:00:00Z',
      updated_at: '2026-06-12T08:00:00Z',
    },
  },
];

async function main() {
  console.log(`[seed] vault: ${VAULT_PATH}`);
  console.log(`[seed] leads: ${LEADS_DIR}`);
  await fs.mkdir(LEADS_DIR, { recursive: true });

  for (const lead of SEED_LEADS) {
    const cleanData = Object.fromEntries(
      Object.entries(lead.data).filter(([, v]) => v !== undefined),
    );
    const file = matter.stringify(lead.body, cleanData);
    const fullPath = path.join(LEADS_DIR, `${lead.id}.md`);
    await fs.writeFile(fullPath, file, 'utf8');
    // pausa para que OneDrive sincronice
    await new Promise((r) => setTimeout(r, 600));
  }

  // pausa final
  await new Promise((r) => setTimeout(r, 1500));

  console.log('[seed] verificación final:');
  const files = (await fs.readdir(LEADS_DIR)).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const c = await fs.readFile(path.join(LEADS_DIR, f), 'utf8');
    const m = c.match(/^nombre:\s*(.+)$/m);
    console.log(`  - ${f}: ${m ? m[1] : '(sin nombre)'}`);
  }
  console.log(`[seed] OK — ${SEED_LEADS.length} leads`);
}

main().catch((err) => {
  console.error('[seed] ERROR:', err);
  process.exit(1);
});
