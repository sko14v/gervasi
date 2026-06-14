import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AgentResult } from './base-agent.js';
import type { Sesion, Llamada, ScoreDetalleSesion } from '@agentik-os/shared';
import { splitAudio, getAudioDuration } from '../services/audio.service.js';
import { transcribeAudioInParallel, mergeTranscripts, type Turn } from '../services/gemini.service.js';
import { chat, isConfigured } from '../services/minimax.service.js';
import { writeSession, getSession, appendToLog } from '../services/vault.service.js';
import * as graphify from '../services/graphify.service.js';
import { logger } from '../utils/logger.js';

export interface CallAnalyzerInput {
  sesionId: string;
  audioPaths: string[];
  onProgress?: (msg: string) => void;
}

export interface CallAnalyzerResult {
  sesionId: string;
  num_llamadas: number;
  num_citas: number;
  icl_promedio: number;
  icl_promedio_grado: 'A' | 'B' | 'C' | 'D' | 'F';
  talk_ratio_promedio: number;
  sentimiento_general: 'positivo' | 'neutro' | 'negativo';
  llamadas: Llamada[];
}

/** Fallback scorecard criteria description if Graphify doesn't return it */
const SCORECARD_FALLBACK_GUIDE = `
Distribución de Pesos:
- Paso 2: Diagnóstico + Dolor (30% del ICL)
- Paso 5: Cierre / Booking (25% del ICL)
- Paso 1: Apertura (15% del ICL)
- Paso 4: Filtro de Tiempo (15% del ICL)
- Paso 3: Filtro de Dinero (10% del ICL)
- Paso 0: Gatekeeper (5% del ICL)

Errores Fatales por Fase (Anulan la puntuación de su fase a 0 si están activos):
- FE-0: Explicar el servicio al recepcionista/gatekeeper.
- FE-1: Vender en la apertura (precios, plazos, resultados, agendar antes de calificar).
- FE-2: Vender durante el diagnóstico.
- FE-2b: Pitch + agendar sin calificar dinero y tiempo.
- FE-3: Agendar con prospecto en supervivencia real (<5000€).
- FE-4: Agendar con prospecto que no puede empezar en 5-10 días.
- FE-5: Agendar con closer sin validar dinero y tiempo en verde.

Errores Críticos Globales (Capan el ICL máximo a 44, grado F):
- ECG-1: Enviar prospecto no calificado al closer.
- ECG-2: Mentir o exagerar sobre el servicio.
- ECG-3: Agresividad o falta de respeto.

Fórmula ICL:
ICL = (P2 * 0.30) + (P5 * 0.25) + (P1 * 0.15) + (P4 * 0.15) + (P3 * 0.10) + (P0 * 0.05)
(Si algún ECG está activo, el ICL se capa a un máximo de 44)
`;

function getIclGrado(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function mockCallTurns(idx: number): Turn[] {
  const turns: Turn[] = [
    { t: '00:00:03', absSec: 3, speaker: 'setter', text: 'Hola buenas tardes, ¿hablo con el dueño de Inmobiliaria Sol?' },
    { t: '00:00:08', absSec: 8, speaker: 'prospecto', text: 'Hola, sí, soy yo. ¿Quién es?' },
    { t: '00:00:12', absSec: 12, speaker: 'setter', text: 'Mire, esto es una llamada comercial de 10 segundos, si no le interesa me cuelga, ¿le parece bien?' },
    { t: '00:00:18', absSec: 18, speaker: 'prospecto', text: 'Bueno, cuéntame rápido.' },
    { t: '00:00:22', absSec: 22, speaker: 'setter', text: 'Somos una consultora especializada en sistemas de captación en exclusiva para agencias.' },
    { t: '00:00:30', absSec: 30, speaker: 'prospecto', text: 'Ah, pues nosotros ya hacemos marketing.' },
    { t: '00:00:35', absSec: 35, speaker: 'setter', text: 'Le entiendo, no somos de marketing. ¿Cuántas exclusivas firman al mes actualmente?' },
    { t: '00:00:42', absSec: 42, speaker: 'prospecto', text: 'Pues una o dos como mucho.' },
    { t: '00:00:46', absSec: 46, speaker: 'setter', text: '¿Y cuál sería su objetivo?' },
    { t: '00:00:50', absSec: 50, speaker: 'prospecto', text: 'Nos gustaría firmar 5 o 6 al mes para estar tranquilos.' },
    { t: '00:00:55', absSec: 55, speaker: 'setter', text: '¿Y si esto sigue igual 6 meses qué pasaría?' },
    { t: '00:01:00', absSec: 60, speaker: 'prospecto', text: 'Pues que tendríamos que reducir equipo, está difícil.' },
    { t: '00:01:05', absSec: 65, speaker: 'setter', text: 'Entiendo. Para lograr esas 6 exclusivas, ¿estaría dispuesto a invertir entre 5.000 y 10.000 euros o está en modo supervivencia?' },
    { t: '00:01:14', absSec: 74, speaker: 'prospecto', text: 'No, si hay retorno podemos invertir, tenemos liquidez.' },
    { t: '00:01:20', absSec: 80, speaker: 'setter', text: 'Perfecto. Y para empezar, ¿sería en los próximos 5 a 10 días o en unos meses?' },
    { t: '00:01:27', absSec: 87, speaker: 'prospecto', text: 'Podemos empezar ya mismo si cuadra.' },
    { t: '00:01:32', absSec: 92, speaker: 'setter', text: 'Genial. Le propongo una reunión con David, que montó el sistema en Palma facturando 100.000€ al mes. ¿Le viene mejor martes o jueves?' },
    { t: '00:01:42', absSec: 102, speaker: 'prospecto', text: 'El jueves por la mañana me va bien.' },
    { t: '00:01:46', absSec: 106, speaker: 'setter', text: 'Perfecto, agendado. ¿No serás de los que cancelan a última hora, no? jiji' },
    { t: '00:01:52', absSec: 112, speaker: 'prospecto', text: 'No, no, si me comprometo voy.' },
    { t: '00:01:56', absSec: 116, speaker: 'setter', text: 'Perfecto. ¿Me confirma su móvil y correo?' }
  ];
  return turns;
}

function mockCallAnalysis(idx: number): any {
  return {
    icl: idx === 0 ? 88 : 74,
    icl_grado: idx === 0 ? 'B' : 'C',
    score_detalle: {
      apertura: 90,
      diagnostico: idx === 0 ? 95 : 60,
      dinero: 80,
      tiempo: 100,
      cierre: 85,
      gatekeeper: 100
    },
    talk_ratio: 0.42,
    sentimiento: 'positivo',
    objeciones_detectadas: ['marketing previo'],
    errores_fatales: [],
    errores_criticos: [],
    cita_agendada: idx === 0,
    resultado: idx === 0 ? 'verde' : 'amarillo'
  };
}

export async function runCallAnalyzerAgent(
  input: CallAnalyzerInput,
): Promise<AgentResult<CallAnalyzerResult>> {
  const start = performance.now();
  const sesionId = input.sesionId;
  const isDevMode = !isConfigured() || !process.env.GEMINI_API_KEY;

  if (isDevMode) {
    logger.warn('call-analyzer', 'Falta API key de MiniMax o Gemini → Modo [DEV-MOCK]');
  }

  logger.info('call-analyzer', `Iniciando análisis de sesión: ${sesionId} con ${input.audioPaths.length} archivos`);

  // Crear directorio temporal para los chunks
  const tempDir = path.join(process.cwd(), 'temp', sesionId);
  await fs.mkdir(tempDir, { recursive: true });

  const llamadas: Llamada[] = [];

  try {
    // 1) Obtener contexto de la scorecard desde Graphify
    let scorecardContext = '';
    try {
      const gResult = await graphify.query('scorecard evaluacion cold calling col-analyser v3.1 criterios pesos errores fatales criticos formula icl');
      if (gResult.ok) {
        scorecardContext = gResult.data.answer;
      }
    } catch (err) {
      logger.warn('call-analyzer', `No se pudo consultar Graphify para la scorecard: ${err}`);
    }
    const finalScorecardContext = scorecardContext || SCORECARD_FALLBACK_GUIDE;

    // 2) Procesar cada audio de llamada
    for (let idx = 0; idx < input.audioPaths.length; idx++) {
      const audioPath = input.audioPaths[idx]!;
      const filename = path.basename(audioPath);
      const callId = `LL-${String(idx + 1).padStart(3, '0')}`;
      input.onProgress?.(`Procesando llamada ${idx + 1}/${input.audioPaths.length}: ${filename}`);

      let duracion_seg = 0;
      let turns: Turn[] = [];

      if (isDevMode) {
        // En modo desarrollo usamos mocks rápidos
        duracion_seg = 120;
        turns = mockCallTurns(idx);
      } else {
        // En producción procesamos el audio real
        duracion_seg = Math.round(await getAudioDuration(audioPath));
        
        // Trocear audio en chunks
        const chunkPaths = await splitAudio(audioPath, tempDir);
        logger.info('call-analyzer', `Audio ${filename} dividido en ${chunkPaths.length} chunks`);
        
        // Transcribir chunks en paralelo
        const chunksTurns = await transcribeAudioInParallel(chunkPaths);
        
        // Fusionar transcripciones
        turns = mergeTranscripts(chunksTurns);

        // Limpiar archivos de chunks creados
        for (const chunkPath of chunkPaths) {
          await fs.unlink(chunkPath).catch(() => {});
        }
      }

      // Convertir lista de turnos en un string legible
      const formattedTranscript = turns.map(t => `${t.t} [${t.speaker.toUpperCase()}]: ${t.text}`).join('\n');

      let analysis: any;
      if (isDevMode) {
        analysis = mockCallAnalysis(idx);
      } else {
        // Ejecutar scoring usando MiniMax M3
        const systemPrompt = `Eres un auditor experto en calidad de llamadas de venta (cold calling). Evalúas usando la scorecard COL-Analyser v3.1. Devuelve únicamente JSON válido, sin formato markdown ni bloques de código.`;
        
        const prompt = [
          '[TAREA]',
          'Evalúa la calidad de la siguiente llamada de ventas fría según la scorecard COL-Analyser v3.1.',
          '[TRANSCRIPCIÓN]',
          formattedTranscript,
          '[SCORECARD COL-ANALYSER V3.1]',
          finalScorecardContext,
          '[REGLAS]',
          '- Revisa detalladamente si hay errores fatales (FE-0 a FE-5) en base a los criterios exactos.',
          '- Calcula las puntuaciones P0, P1, P2, P3, P4, P5 basándote en los porcentajes indicados en la guía.',
          '- Aplica los errores fatales: si ocurre uno, la puntuación de esa fase específica es 0.',
          '- Calcula el ICL final ponderado: ICL = (P2 * 0.30) + (P5 * 0.25) + (P1 * 0.15) + (P4 * 0.15) + (P3 * 0.10) + (P0 * 0.05).',
          '- Revisa si hay errores críticos globales (ECG-1 a ECG-3): si hay alguno, la puntuación máxima final del ICL es 44 (Grado F).',
          '- Calcula el ratio de habla del setter (talk_ratio) en función del contenido de la llamada.',
          '- Determina el sentimiento general.',
          '- Indica si se agendó cita con el closer (cita_agendada).',
          '- Clasifica el resultado: verde (calificado + agendado), amarillo (calificado pero no agendado / seguimiento), rojo (descartado).',
          '- Entrega únicamente un objeto JSON con la estructura requerida.',
          '[OUTPUT FORMAT]',
          '{',
          '  "icl": number, // 0-100',
          '  "icl_grado": "A"|"B"|"C"|"D"|"F",',
          '  "score_detalle": {',
          '    "apertura": number,',
          '    "diagnostico": number,',
          '    "dinero": number,',
          '    "tiempo": number,',
          '    "cierre": number,',
          '    "gatekeeper": number',
          '  },',
          '  "talk_ratio": number,',
          '  "sentimiento": "positivo"|"neutro"|"negativo",',
          '  "objeciones_detectadas": ["string"],',
          '  "errores_fatales": ["string"],',
          '  "errores_criticos": ["string"],',
          '  "cita_agendada": boolean,',
          '  "resultado": "verde"|"amarillo"|"rojo"|"no_calificado"',
          '}'
        ].join('\n');

        const minimaxRes = await chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ], { model: 'minimax-m3', temperature: 0.2, max_tokens: 1500, json: true });

        // Intentar parsear el JSON de MiniMax
        try {
          const cleanJsonStr = minimaxRes.replace(/^[^{\[]*/, '').replace(/[^}\]]*$/, '');
          analysis = JSON.parse(cleanJsonStr);
        } catch (err) {
          logger.error('call-analyzer', `No se pudo parsear el resultado de MiniMax para ${callId}. Usando fallback. Res: ${minimaxRes}`);
          analysis = mockCallAnalysis(idx);
        }
      }

      // Estructurar la llamada
      const llamada: Llamada = {
        id: callId,
        sesion_id: sesionId,
        duracion_seg,
        transcripcion: formattedTranscript,
        timestamps: turns.map(t => ({
          t: t.absSec,
          speaker: t.speaker,
          text: t.text
        })),
        icl: analysis.icl ?? 50,
        icl_grado: (analysis.icl_grado as Llamada['icl_grado']) ?? 'C',
        score_detalle: {
          apertura: analysis.score_detalle?.apertura ?? 50,
          diagnostico: analysis.score_detalle?.diagnostico ?? 50,
          dinero: analysis.score_detalle?.dinero ?? 50,
          tiempo: analysis.score_detalle?.tiempo ?? 50,
          cierre: analysis.score_detalle?.cierre ?? 50,
          gatekeeper: analysis.score_detalle?.gatekeeper ?? 50,
        },
        talk_ratio: analysis.talk_ratio ?? 0.5,
        sentimiento: (analysis.sentimiento as Llamada['sentimiento']) ?? 'neutro',
        objeciones_detectadas: analysis.objeciones_detectadas ?? [],
        errores_fatales: analysis.errores_fatales ?? [],
        errores_criticos: analysis.errores_criticos ?? [],
        cita_agendada: !!analysis.cita_agendada,
        resultado: (analysis.resultado as Llamada['resultado']) ?? 'no_calificado',
      };

      llamadas.push(llamada);
    }

    // 3) Calcular agregaciones a nivel de sesión
    const duracion_total_seg = llamadas.reduce((acc, l) => acc + l.duracion_seg, 0);
    const num_llamadas = llamadas.length;
    const num_citas = llamadas.filter(l => l.cita_agendada).length;
    
    // Promedio ICL
    const icl_promedio = Math.round(llamadas.reduce((acc, l) => acc + (l.icl ?? 0), 0) / (num_llamadas || 1));
    const icl_promedio_grado = getIclGrado(icl_promedio);

    // Promedio talk ratio
    const talk_ratio_promedio = Number((llamadas.reduce((acc, l) => acc + (l.talk_ratio ?? 0.5), 0) / (num_llamadas || 1)).toFixed(2));

    // Sentimiento general por mayoría
    const sentimientos = llamadas.map(l => l.sentimiento).filter(Boolean);
    const counts = sentimientos.reduce((acc, s) => {
      acc[s!] = (acc[s!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    let sentimiento_general: 'positivo' | 'neutro' | 'negativo' = 'neutro';
    let maxCount = 0;
    for (const [s, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        sentimiento_general = s as any;
      }
    }

    // 4) Cargar sesión existente o crear una nueva
    let sesion = await getSession(sesionId);
    if (!sesion) {
      sesion = {
        id: sesionId,
        fecha: new Date().toISOString().slice(0, 10),
        duracion_total_seg,
        num_llamadas,
        num_citas,
        icl_promedio,
        icl_promedio_grado,
        talk_ratio_promedio,
        sentimiento_general,
        estado: 'analizada',
        audio_paths: input.audioPaths,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      sesion = {
        ...sesion,
        duracion_total_seg,
        num_llamadas,
        num_citas,
        icl_promedio,
        icl_promedio_grado,
        talk_ratio_promedio,
        sentimiento_general,
        estado: 'analizada',
        updated_at: new Date().toISOString(),
      };
    }
    
    // Añadimos las llamadas evaluadas al objeto de sesión
    sesion.llamadas = llamadas;

    // Guardamos la sesión en el Vault
    await writeSession(sesion);

    // Log en el archivo log.md
    await appendToLog({
      agente: 'call-analyzer',
      accion: 'sesion-analizada',
      detalle: `sesion=${sesionId} llamadas=${num_llamadas} citas=${num_citas} icl_promedio=${icl_promedio} (${icl_promedio_grado})`,
    }).catch(() => {});

    // 5) Re-indexar Graphify
    void graphify.reindex().catch(() => {});

    // Limpiar directorio temporal
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    const duration_ms = Math.round(performance.now() - start);

    return {
      ok: true,
      data: {
        sesionId,
        num_llamadas,
        num_citas,
        icl_promedio,
        icl_promedio_grado,
        talk_ratio_promedio,
        sentimiento_general,
        llamadas
      },
      duration_ms
    };

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const duration_ms = Math.round(performance.now() - start);
    logger.error('call-analyzer', `Crashed: ${message}`);
    
    // Limpieza en catch
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    return {
      ok: false,
      error: message,
      duration_ms
    };
  }
}
