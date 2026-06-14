/**
 * CRM Manager Agent — Iron Monkey Charter
 *
 * Trigger: manual (GET /digest/ironmonkey) o al abrir la app.
 * Lee: todos los leads del vault.
 * Calcula: alertas (sin actividad >48h, propuestas sin respuesta, leads calientes sin avance).
 * Genera: digest estructurado con items priorizados.
 * Persiste: vault/01-IronMonkeyCharter/pipeline-actual.md
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { listLeads } from '../services/vault.service.js';
import { VAULT_PATHS } from '../config/paths.js';
import { logger } from '../utils/logger.js';
import type { AgentResult } from './base-agent.js';
import type { Lead } from '@agentik-os/shared';

export interface CrmManagerInput {
  action?: 'digest_0800' | 'digest_1800' | 'followup_check' | string;
  payload?: unknown;
}

export interface CrmAlertItem {
  leadId: string;
  leadNombre: string;
  reason: string;
  priority: 'alta' | 'media' | 'baja';
  estado: string;
  diasSinActividad?: number;
}

export interface PipelineCount {
  estado: string;
  count: number;
}

export interface CrmManagerResult {
  fecha: string;
  action: string;
  summary: string;
  total_leads: number;
  pipeline: PipelineCount[];
  items: CrmAlertItem[];
  leads_calientes: number;
  propuestas_enviadas: number;
  leads_sin_actividad_48h: number;
}

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };

function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return 999;
  const ts = Date.parse(String(dateStr));
  if (isNaN(ts)) return 999;
  return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
}

export async function runCrmManagerAgent(
  input: CrmManagerInput = {},
): Promise<AgentResult<CrmManagerResult>> {
  const t0 = Date.now();
  const action = input.action ?? 'digest_0800';

  try {
    const leads = await listLeads();
    const fecha = new Date().toISOString().slice(0, 10);

    // --- 1. Pipeline count por estado ---
    const pipelineMap = new Map<string, number>();
    for (const lead of leads) {
      pipelineMap.set(lead.estado, (pipelineMap.get(lead.estado) ?? 0) + 1);
    }
    const pipeline: PipelineCount[] = Array.from(pipelineMap.entries()).map(
      ([estado, count]) => ({ estado, count }),
    );

    // --- 2. Métricas clave ---
    const leads_calientes = leads.filter(
      (l) => l.sensacion === 'caliente' && l.estado !== 'descartado',
    ).length;

    const propuestas_enviadas = leads.filter(
      (l) => l.estado === 'propuesta_enviada',
    ).length;

    // --- 3. Construcción de alertas ---
    const items: CrmAlertItem[] = [];

    for (const lead of leads) {
      if (lead.estado === 'descartado') continue;

      const dias = daysSince(String(lead.updated_at));

      // Alerta ALTA: leads calientes sin movimiento >1 día
      if (lead.sensacion === 'caliente' && dias >= 1 && lead.estado !== 'ganado') {
        items.push({
          leadId: lead.id,
          leadNombre: lead.nombre || lead.id,
          reason: `Lead caliente sin actividad hace ${dias} día(s) — ¡no pierdas el momentum!`,
          priority: 'alta',
          estado: lead.estado,
          diasSinActividad: dias,
        });
        continue;
      }

      // Alerta ALTA: propuesta enviada sin respuesta >3 días
      if (lead.estado === 'propuesta_enviada' && dias >= 3) {
        items.push({
          leadId: lead.id,
          leadNombre: lead.nombre || lead.id,
          reason: `Propuesta enviada hace ${dias} días sin respuesta. Haz follow-up hoy.`,
          priority: 'alta',
          estado: lead.estado,
          diasSinActividad: dias,
        });
        continue;
      }

      // Alerta MEDIA: cualquier lead sin actividad >48h
      if (dias >= 2 && lead.estado !== 'ganado' && lead.estado !== 'perdido') {
        items.push({
          leadId: lead.id,
          leadNombre: lead.nombre || lead.id,
          reason: `Sin actividad hace ${dias} días. Revisa el estado del lead.`,
          priority: 'media',
          estado: lead.estado,
          diasSinActividad: dias,
        });
      }

      // Alerta BAJA: leads cualificados sin propuesta >5 días
      if (
        lead.estado === 'cualificado' &&
        lead.score >= 7 &&
        dias >= 5
      ) {
        items.push({
          leadId: lead.id,
          leadNombre: lead.nombre || lead.id,
          reason: `Lead cualificado (score ${lead.score}) sin propuesta enviada. Considera hacer oferta.`,
          priority: 'media',
          estado: lead.estado,
          diasSinActividad: dias,
        });
      }
    }

    // Eliminar duplicados y ordenar por prioridad
    const seen = new Set<string>();
    const uniqueItems = items
      .filter((item) => {
        if (seen.has(item.leadId)) return false;
        seen.add(item.leadId);
        return true;
      })
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    const leads_sin_actividad_48h = uniqueItems.filter(
      (i) => (i.diasSinActividad ?? 0) >= 2,
    ).length;

    const altaCount = uniqueItems.filter((i) => i.priority === 'alta').length;
    const summary =
      altaCount > 0
        ? `${altaCount} alerta(s) de prioridad alta. Revisa el pipeline.`
        : leads.length === 0
          ? 'Sin leads en el pipeline todavía. ¡A prospectar!'
          : `Pipeline con ${leads.length} leads. Todo bajo control.`;

    const result: CrmManagerResult = {
      fecha,
      action,
      summary,
      total_leads: leads.length,
      pipeline,
      items: uniqueItems,
      leads_calientes,
      propuestas_enviadas,
      leads_sin_actividad_48h,
    };

    // --- 4. Persistir digest en vault ---
    await persistDigest(result, leads);

    logger.info('crm-manager', `digest OK: ${uniqueItems.length} alertas, ${leads.length} leads`);

    return {
      ok: true,
      data: result,
      duration_ms: Date.now() - t0,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('crm-manager', `error: ${msg}`);
    return {
      ok: false,
      error: msg,
      duration_ms: Date.now() - t0,
    };
  }
}

async function persistDigest(result: CrmManagerResult, leads: Lead[]): Promise<void> {
  const dir = VAULT_PATHS.ironMonkey;
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch { /* ok */ }

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const ts = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  let md = `# Pipeline Actual — Iron Monkey Charter\n\n`;
  md += `> Generado: ${ts}\n\n`;
  md += `## Resumen\n\n`;
  md += `- **Leads totales:** ${result.total_leads}\n`;
  md += `- **Leads calientes:** ${result.leads_calientes}\n`;
  md += `- **Propuestas enviadas:** ${result.propuestas_enviadas}\n`;
  md += `- **Sin actividad >48h:** ${result.leads_sin_actividad_48h}\n\n`;

  if (result.pipeline.length > 0) {
    md += `## Pipeline por estado\n\n`;
    for (const p of result.pipeline) {
      md += `- **${p.estado}**: ${p.count}\n`;
    }
    md += `\n`;
  }

  if (result.items.length > 0) {
    md += `## Alertas (${result.items.length})\n\n`;
    for (const item of result.items) {
      const emoji = item.priority === 'alta' ? '🔴' : item.priority === 'media' ? '🟡' : '🟢';
      md += `${emoji} **[${item.priority.toUpperCase()}]** ${item.leadNombre} (${item.leadId})\n`;
      md += `   → ${item.reason}\n\n`;
    }
  } else {
    md += `## Alertas\n\n✅ Sin alertas activas. ¡Buen trabajo!\n\n`;
  }

  const filePath = path.join(dir, 'pipeline-actual.md');
  await fs.writeFile(filePath, md, 'utf8');
}
