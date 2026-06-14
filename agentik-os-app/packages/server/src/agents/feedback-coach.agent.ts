import type { AgentResult } from './base-agent.js';
import type { FeedbackSesion, Sesion, FipaItem } from '@agentik-os/shared';
import { getSession, writeSession, listSessions, getFeedback, writeFeedback, appendToLog } from '../services/vault.service.js';
import { chat, isConfigured } from '../services/minimax.service.js';
import * as graphify from '../services/graphify.service.js';
import { logger } from '../utils/logger.js';

export interface FeedbackCoachInput {
  sesionId: string;
}

function getIclGrado(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function mockFeedback(sesionId: string, icl: number, prevIcl?: number): FeedbackSesion {
  return {
    sesion_id: sesionId,
    fecha: new Date().toISOString().slice(0, 10),
    score_global: icl,
    grado: getIclGrado(icl),
    score_anterior: prevIcl,
    wins: [
      'Excelente control del marco temporal en la llamada LL-001, guiando al prospecto con naturalidad.',
      'Cumplimiento del 100% de la declaración comercial explícita en la apertura, sin titubeos.',
      'Gran capacidad de escucha activa (talk ratio del 35% por parte del setter en la llamada exitosa).'
    ],
    improvements: [
      'En la llamada LL-002 se intentó agendar antes de calificar completamente el filtro de tiempo.',
      'Falta de edificación de la autoridad de David (closer) en la segunda llamada.',
      'Se aceptaron respuestas evasivas sobre el presupuesto en el diagnóstico inicial.'
    ],
    fipas: [
      {
        area: 'diagnostico',
        insight: 'Respuestas de presupuesto vagas permitidas sin profundizar.',
        objetivo: 'Hacer al menos una pregunta de profundización (ej: ¿cuánto facturan aproximadamente?) ante respuestas vagas.',
        aplicado: false
      },
      {
        area: 'cierre',
        insight: 'Omisión del marco de anti-cancelación con humor.',
        objetivo: 'Preguntar verbalmente: "¿No serás de los que cancelan a última hora, no? jiji" en todos los bookings.',
        aplicado: false
      }
    ],
    tendencia_5: prevIcl ? [72, 75, 78, prevIcl, icl] : [72, 75, 78, 80, icl],
    recomendacion: 'Estás mostrando una evolución sólida. El foco de mañana debe ser no acelerar el cierre. Mantén el ritmo en el diagnóstico y asegúrate de calificar dinero y tiempo antes de mencionar la agenda de David. ¡Sigue así!'
  };
}

export async function runFeedbackCoachAgent(
  input: FeedbackCoachInput,
): Promise<AgentResult<FeedbackSesion>> {
  const start = performance.now();
  const sesionId = input.sesionId;
  const isDevMode = !isConfigured();

  logger.info('feedback-coach', `Iniciando Feedback Coach para sesión: ${sesionId}`);

  try {
    // 1) Cargar la sesión actual
    const sesion = await getSession(sesionId);
    if (!sesion) {
      return { ok: false, error: `sesión no encontrada: ${sesionId}`, duration_ms: 0 };
    }

    // 2) Obtener listado de sesiones para calcular tendencia e ICL anterior
    const allSessions = await listSessions();
    const sortedSessions = allSessions
      .filter((s) => s.icl_promedio !== undefined && String(s.fecha) <= String(sesion.fecha))
      .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))); // De más antigua a más nueva

    const currentIdx = sortedSessions.findIndex((s) => s.id === sesionId);
    
    let score_anterior: number | undefined;
    if (currentIdx > 0) {
      score_anterior = sortedSessions[currentIdx - 1]?.icl_promedio;
    }

    // Calcular las últimas 5 puntuaciones de tendencia
    const last5Sessions = sortedSessions.slice(Math.max(0, currentIdx - 4), currentIdx + 1);
    const tendencia_5 = last5Sessions.map((s) => s.icl_promedio!).filter(Boolean);

    // Si no hay tendencia o está vacía, agregamos la actual
    if (tendencia_5.length === 0 && sesion.icl_promedio !== undefined) {
      tendencia_5.push(sesion.icl_promedio);
    }

    const icl = sesion.icl_promedio ?? 70;

    if (isDevMode) {
      const fb = mockFeedback(sesionId, icl, score_anterior);
      
      // Escribir el feedback en el Vault
      await writeFeedback(fb);

      // Actualizar sesión a con_feedback
      sesion.estado = 'con_feedback';
      sesion.feedback_id = sesionId;
      await writeSession(sesion);

      await appendToLog({
        agente: 'feedback-coach',
        accion: 'feedback-generado',
        detalle: `sesion=${sesionId} score=${icl} fipas=${fb.fipas.length} [DEV-MOCK]`,
      }).catch(() => {});

      const duration_ms = Math.round(performance.now() - start);
      return { ok: true, data: fb, duration_ms };
    }

    // 3) Obtener contexto del guión y políticas de ventas vía Graphify
    let scriptContext = '';
    try {
      const gResult = await graphify.query('script guion llamadas Growing Inmobiliario objeciones tecnicas de cierre');
      if (gResult.ok) {
        scriptContext = gResult.data.answer;
      }
    } catch (err) {
      logger.warn('feedback-coach', `No se pudo consultar Graphify para el guión: ${err}`);
    }

    // 4) Preparar los datos de las llamadas evaluadas para enviarlas en el prompt
    const llamadasSummary = (sesion.llamadas ?? []).map((ll) => {
      return [
        `Llamada ID: ${ll.id}`,
        `Duración: ${ll.duracion_seg}s`,
        `ICL: ${ll.icl}/100 (${ll.icl_grado})`,
        `Talk Ratio: ${(ll.talk_ratio ? ll.talk_ratio * 100 : 50).toFixed(0)}%`,
        `Sentimiento: ${ll.sentimiento}`,
        `Cita agendada: ${ll.cita_agendada ? 'SÍ' : 'NO'}`,
        `Errores Fatales: ${ll.errores_fatales?.join(', ') || 'ninguno'}`,
        `Errores Críticos: ${ll.errores_criticos?.join(', ') || 'ninguno'}`,
        `Objeciones: ${ll.objeciones_detectadas?.join(', ') || 'ninguna'}`,
        `Transcripción:`,
        ll.transcripcion ? `> ${ll.transcripcion.split('\n').join('\n> ')}` : '> (sin transcripción)'
      ].join('\n');
    }).join('\n\n──────────────────────────────────────────\n\n');

    // 5) Llamar a MiniMax M3
    const systemPrompt = `Eres un coach de ventas de alto nivel de Growing Inmobiliario. Analizas el desempeño del setter (Xisco) y generas feedback estructurado, directo y constructivo en formato JSON válido.`;
    
    const prompt = [
      '[TAREA]',
      'Genera el feedback diario para la sesión de llamadas de Xisco basándote en la evaluación y transcripción de sus llamadas.',
      '[DATOS DE LA SESIÓN]',
      `Sesión ID: ${sesionId}`,
      `Fecha: ${sesion.fecha}`,
      `ICL Promedio de hoy: ${icl}/100`,
      `Score Anterior: ${score_anterior !== undefined ? score_anterior : 'N/A'}`,
      `Llamadas evaluadas:`,
      llamadasSummary,
      scriptContext ? `[GUION Y CONTEXTO GROWING]\n"""${scriptContext}"""` : '',
      '[PASOS]',
      '1. Analiza los puntos fuertes de hoy (Wins). Genera entre 3 y 5 wins concretos basados en la transcripción.',
      '2. Identifica áreas de mejora (Improvements). Genera entre 3 y 5 mejoras claras.',
      '3. Crea entre 3 y 5 FIPAs (Focus Improvement Plan for Action) para mañana.',
      '   Cada FIPA debe tener un área (ej. apertura, diagnostico, dinero, tiempo, cierre, gatekeeper), un insight (qué se detectó) y un objetivo medible y accionable (cómo medir que se corrige).',
      '4. Redacta una recomendación general que anime y dé pautas claras de coaching para la próxima sesión.',
      '[RESTRICCIONES]',
      '- Devuelve estrictamente un objeto JSON válido.',
      '- No uses formato markdown para envolver el JSON.',
      '- Los FIPAs se inicializan siempre con "aplicado": false.',
      '[OUTPUT FORMAT]',
      '{',
      '  "wins": ["string"], // 3-5 wins',
      '  "improvements": ["string"], // 3-5 mejoras',
      '  "fipas": [',
      '    {',
      '      "area": "apertura"|"diagnostico"|"dinero"|"tiempo"|"cierre"|"gatekeeper",',
      '      "insight": "string",',
      '      "objetivo": "string",',
      '      "aplicado": false',
      '    }',
      '  ],',
      '  "recomendacion": "string" // recomendación del coach',
      '}'
    ].join('\n');

    const minimaxRes = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ], { model: 'minimax-m3', temperature: 0.3, max_tokens: 1800, json: true, agent: 'feedback-coach' });

    let parsed: any;
    try {
      const cleanJsonStr = minimaxRes.replace(/^[^{\[]*/, '').replace(/[^}\]]*$/, '');
      parsed = JSON.parse(cleanJsonStr);
    } catch (err) {
      logger.error('feedback-coach', `No se pudo parsear el resultado de MiniMax para feedback. Usando fallback. Res: ${minimaxRes}`);
      parsed = mockFeedback(sesionId, icl, score_anterior);
    }

    // Crear el objeto FeedbackSesion unificado
    const feedback: FeedbackSesion = {
      sesion_id: sesionId,
      fecha: sesion.fecha,
      score_global: icl,
      grado: getIclGrado(icl),
      score_anterior,
      wins: parsed.wins ?? [],
      improvements: parsed.improvements ?? [],
      fipas: (parsed.fipas ?? []).map((f: any) => ({
        area: f.area ?? 'diagnostico',
        insight: f.insight ?? 'Mejorar fluidez',
        objetivo: f.objetivo ?? 'Seguir el guión',
        aplicado: false
      })),
      tendencia_5,
      recomendacion: parsed.recomendacion ?? 'Buen trabajo hoy.'
    };

    // Escribir el feedback en el Vault
    await writeFeedback(feedback);

    // Actualizar sesión a con_feedback
    sesion.estado = 'con_feedback';
    sesion.feedback_id = sesionId;
    await writeSession(sesion);

    // Log en el archivo log.md
    await appendToLog({
      agente: 'feedback-coach',
      accion: 'feedback-generado',
      detalle: `sesion=${sesionId} score=${icl} fipas=${feedback.fipas.length}`,
    }).catch(() => {});

    // Re-indexar Graphify
    void graphify.reindex().catch(() => {});

    const duration_ms = Math.round(performance.now() - start);
    return {
      ok: true,
      data: feedback,
      duration_ms
    };

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const duration_ms = Math.round(performance.now() - start);
    logger.error('feedback-coach', `Crashed: ${message}`);
    return { ok: false, error: message, duration_ms };
  }
}
