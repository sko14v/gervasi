/**
 * CRM Manager Agent — Iron Monkey Charter (PLACEHOLDER)
 *
 * Trigger: reloj 08:00 + al abrir la app (alertas de follow-up).
 * Lee: todos los leads del vault.
 * Calcula: alertas (sin actividad >48h, propuestas sin respuesta).
 * Genera: digest 08:00 con el estado del pipeline.
 *
 * ESTADO: solo esqueleto. La implementación completa entra en Fase 4.
 * Por ahora, run() devuelve un objeto placeholder para que la ruta
 * HTTP exista y el smoke test pueda verificar el cableado.
 */

import { BaseAgent, type AgentContext, type AgentResult } from './base-agent.js';

export interface CrmManagerInput {
  action: 'digest_0800' | 'digest_1800' | 'followup_check' | string;
  payload?: unknown;
}

export interface CrmManagerResult {
  action: string;
  summary: string;
  items: Array<{ leadId: string; reason: string; priority: 'alta' | 'media' | 'baja' }>;
}

export class CrmManagerAgent extends BaseAgent<CrmManagerInput, CrmManagerResult> {
  constructor() {
    super({
      name: 'crm-manager',
      model: 'minimax-m2.5',
      outputMode: 'caveman',
      maxTokensBudget: 1500,
    });
  }

  protected contextQuery(_input: CrmManagerInput): string {
    return 'leads Iron Monkey Charter estados pipeline alertas follow-ups propuestas';
  }

  protected buildPrompt(_input: CrmManagerInput, _context: AgentContext): string {
    // TODO(Fase 4): construir el prompt real con todos los leads
    return '[TAREA] Genera un digest CRM.\n[NOTA] placeholder — implementación real en Fase 4.\n[OUTPUT] {}';
  }

  protected parseOutput(_raw: string): CrmManagerResult {
    // Placeholder: devolvemos un objeto vacío bien formado.
    return {
      action: 'placeholder',
      summary: 'CRM Manager Agent placeholder. Implementación real en Fase 4.',
      items: [],
    };
  }

  protected async persist(
    _result: CrmManagerResult,
    _input: CrmManagerInput,
  ): Promise<unknown> {
    // TODO(Fase 4): escribir el digest a vault/01-IronMonkeyCharter/pipeline-actual.md
    return { persisted: false, todo: 'Fase 4' };
  }
}

/** Helper para el handler HTTP. */
export async function runCrmManagerAgent(
  input: CrmManagerInput,
): Promise<AgentResult<CrmManagerResult>> {
  const agent = new CrmManagerAgent();
  return agent.run(input);
}
