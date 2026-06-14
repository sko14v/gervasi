/**
 * Ruta de Memory Graph.
 *
 *   GET /graph → Construye el grafo del vault (nodos + links)
 *                compatible con react-force-graph-2d.
 *
 * Tipos de nodos:
 *   - lead       (azul)    → un lead de Iron Monkey
 *   - sesion     (verde)   → una sesión de Growing
 *   - feedback   (naranja) → feedback de una sesión
 *   - propuesta  (morado)  → una propuesta generada
 *
 * Links:
 *   - lead → propuesta (si el lead tiene propuesta en vault)
 *   - sesion → feedback (si la sesión tiene feedback_id)
 */

import { Hono } from 'hono';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { listLeads, listSessions } from '../services/vault.service.js';
import { VAULT_PATHS } from '../config/paths.js';

export const graphRouter = new Hono();

interface GraphNode {
  id: string;
  label: string;
  type: 'lead' | 'sesion' | 'feedback' | 'propuesta';
  metadata?: Record<string, unknown>;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

graphRouter.get('/', async (c) => {
  try {
    const [leads, sesiones] = await Promise.all([listLeads(), listSessions()]);

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // --- Nodos de leads ---
    for (const lead of leads) {
      nodes.push({
        id: `lead-${lead.id}`,
        label: lead.nombre || lead.id,
        type: 'lead',
        metadata: {
          estado: lead.estado,
          score: lead.score,
          sensacion: lead.sensacion,
          origen: lead.origen,
        },
      });
    }

    // --- Verificar propuestas generadas ---
    const propuestasDir = VAULT_PATHS.ironMonkeyPropuestas;
    let propuestaFiles: string[] = [];
    try {
      propuestaFiles = await fs.readdir(propuestasDir);
    } catch { /* dir puede no existir */ }

    for (const file of propuestaFiles.filter((f) => f.endsWith('.pdf'))) {
      // Nombre esperado: IM-2026-001-v1.pdf
      const match = file.match(/^(IM-\d{4}-\d{3})/);
      if (!match) continue;
      const leadId = match[1]!;
      const propId = `propuesta-${file.replace('.pdf', '')}`;

      nodes.push({
        id: propId,
        label: file.replace('.pdf', ''),
        type: 'propuesta',
        metadata: { leadId, file },
      });

      // Link lead → propuesta
      links.push({
        source: `lead-${leadId}`,
        target: propId,
        label: 'propuesta',
      });
    }

    // --- Nodos de sesiones y feedbacks ---
    for (const sesion of sesiones) {
      nodes.push({
        id: `sesion-${sesion.id}`,
        label: `Sesión ${sesion.fecha}`,
        type: 'sesion',
        metadata: {
          estado: sesion.estado,
          icl_promedio: sesion.icl_promedio,
          num_llamadas: sesion.num_llamadas,
          num_citas: sesion.num_citas,
        },
      });

      // Verificar si tiene feedback
      if (sesion.estado === 'con_feedback' || sesion.feedback_id) {
        const fbId = `feedback-${sesion.id}`;
        nodes.push({
          id: fbId,
          label: `Feedback ${sesion.fecha}`,
          type: 'feedback',
          metadata: { sesionId: sesion.id },
        });

        // Link sesion → feedback
        links.push({
          source: `sesion-${sesion.id}`,
          target: fbId,
          label: 'feedback',
        });
      }
    }

    return c.json({
      ok: true,
      nodes,
      links,
      stats: {
        total_nodes: nodes.length,
        total_links: links.length,
        leads: leads.length,
        sesiones: sesiones.length,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: 500 }, 500);
  }
});
