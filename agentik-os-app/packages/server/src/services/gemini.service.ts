import { promises as fs } from 'node:fs';
import { MODEL_CONFIG } from '../config/models.js';
import { logger } from '../utils/logger.js';

const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS ?? '60000');

export interface RawTurn {
  t: string;       // relative time (e.g. HH:MM:SS or MM:SS)
  speaker: string; // SPEAKER_1, XISCO, etc.
  text: string;    // speech text
}

export interface Turn {
  t: string;       // HH:MM:SS
  absSec: number;  // Absolute seconds
  speaker: 'setter' | 'prospecto';
  text: string;
}

// Convert relative timestamp to seconds
export function parseTimeToSeconds(t: string): number {
  if (!t) return 0;
  const clean = t.trim();
  const parts = clean.split(':').map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return (m || 0) * 60 + (s || 0);
  }
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

// Convert seconds to HH:MM:SS
export function secondsToTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Transcribe un fragmento individual utilizando la API de Gemini.
 */
export async function transcribeChunk(chunkPath: string, offsetSeconds: number): Promise<Turn[]> {
  const apiKey = MODEL_CONFIG.gemini.apiKey;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no configurada en las variables de entorno');
  }

  logger.info('gemini', `Leyendo archivo de audio para transcribir: ${chunkPath}`);

  try {
    const audioBase64 = await fs.readFile(chunkPath, { encoding: 'base64' });

    const prompt = `
[TAREA]
Transcribir este audio de una llamada de ventas fría (cold calling).
Identificar exactamente 2 locutores:
- XISCO: el vendedor (voz masculina, español, inicia la llamada)
- PROSPECTO: el receptor de la llamada

[REGLAS]
- Si hay silencios > 3 segundos, marcar como {"t": "...", "speaker": "SILENCIO", "text": "[pausa 5s]"}
- Si no puedes identificar quién habla, usar "DESCONOCIDO"
- Preservar muletillas, titubeos y expresiones coloquiales (son relevantes para el scoring)
- No corregir gramática — transcribir literal
- Timestamps relativos al inicio del chunk
`;

    const url = `${MODEL_CONFIG.gemini.baseUrl}/v1/models/${MODEL_CONFIG.gemini.model}:generateContent`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'audio/mpeg',
                data: audioBase64
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              t: { type: 'STRING' },
              speaker: { type: 'STRING' },
              text: { type: 'STRING' }
            },
            required: ['t', 'speaker', 'text']
          }
        },
        temperature: 0.2
      }
    };

    logger.info('gemini', `Llamando a la API de Gemini para: ${chunkPath}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('gemini', `Error en la llamada a Gemini: status=${response.status}`);
      throw new Error(`Gemini API error (status ${response.status}): ${errorText}`);
    }

    const result = (await response.json()) as any;
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('Gemini devolvió una respuesta vacía');
    }

    let rawTurns: RawTurn[];
    try {
      rawTurns = JSON.parse(responseText.trim()) as RawTurn[];
    } catch (parseErr) {
      logger.error('gemini', `Respuesta de Gemini no es JSON válido para ${chunkPath}: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      throw new Error(`Gemini response parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
    }

    logger.info('gemini', `Chunk transcrito con éxito: ${rawTurns.length} turnos detectados`);

    // Normalizar turnos y calcular tiempos absolutos
    return rawTurns.map((rt) => {
      const relativeSec = parseTimeToSeconds(rt.t);
      const absSec = offsetSeconds + relativeSec;

      // Normalización de speaker
      let speaker: 'setter' | 'prospecto' = 'setter';
      const cleanSp = rt.speaker.toLowerCase();
      if (cleanSp.includes('prospect') || cleanSp.includes('client') || cleanSp.includes('receptor') || cleanSp.includes('speaker_2') || cleanSp.includes('2')) {
        speaker = 'prospecto';
      } else if (cleanSp.includes('xisco') || cleanSp.includes('vendedor') || cleanSp.includes('setter') || cleanSp.includes('speaker_1') || cleanSp.includes('1')) {
        speaker = 'setter';
      }

      return {
        t: secondsToTime(absSec),
        absSec,
        speaker,
        text: rt.text
      };
    });
  } catch (err) {
    logger.error('gemini', `Fallo al transcribir chunk ${chunkPath}: ${err instanceof Error ? err.message : String(err)}`);
    await fs.unlink(chunkPath).catch((cleanupErr) => {
      logger.error('gemini', `No se pudo eliminar el chunk temporal ${chunkPath}: ${cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr)}`);
    });
    throw err;
  }
}

/**
 * Transcribe en paralelo varios chunks de audio (con un límite de concurrencia de 4).
 */
export async function transcribeAudioInParallel(chunkPaths: string[]): Promise<Turn[][]> {
  const results: Turn[][] = new Array(chunkPaths.length);
  
  // Procesamos en lotes de 4 chunks para no saturar las conexiones/rate limits
  const concurrency = 4;
  for (let i = 0; i < chunkPaths.length; i += concurrency) {
    const batch = chunkPaths.slice(i, i + concurrency);
    const promises = batch.map((chunkPath, index) => {
      const chunkIdx = i + index;
      const offsetSeconds = chunkIdx * 900; // Cada chunk empieza a los 15 minutos (900s)
      return transcribeChunk(chunkPath, offsetSeconds).then((turns) => {
        results[chunkIdx] = turns;
      });
    });
    
    await Promise.all(promises);
  }
  
  return results;
}

/**
 * Junta las transcripciones de cada chunk eliminando duplicados.
 */
export function mergeTranscripts(chunksTurns: Turn[][]): Turn[] {
  if (chunksTurns.length === 0) return [];
  if (chunksTurns.length === 1) return chunksTurns[0]!;

  let merged: Turn[] = [...chunksTurns[0]!];

  for (let i = 1; i < chunksTurns.length; i++) {
    const nextChunk = chunksTurns[i]!;
    const offsetCurr = i * 900;
    const overlapStart = offsetCurr;
    const overlapEnd = offsetCurr + 10;

    const prevOverlapTurns = merged.filter(t => t.absSec >= overlapStart);
    const currOverlapTurns = nextChunk.filter(t => t.absSec < overlapEnd);

    let matchIdxPrev = -1;
    let matchIdxCurr = -1;

    const normalize = (txt: string) => txt.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (let pIdx = 0; pIdx < prevOverlapTurns.length; pIdx++) {
      const pTurn = prevOverlapTurns[pIdx]!;
      const pNorm = normalize(pTurn.text);
      if (pNorm.length < 5) continue;

      for (let cIdx = 0; cIdx < currOverlapTurns.length; cIdx++) {
        const cTurn = currOverlapTurns[cIdx]!;
        const cNorm = normalize(cTurn.text);
        if (cNorm.length < 5) continue;

        if (pTurn.speaker === cTurn.speaker && (pNorm.includes(cNorm) || cNorm.includes(pNorm) || similarity(pNorm, cNorm) > 0.7)) {
          matchIdxPrev = pIdx;
          matchIdxCurr = cIdx;
          break;
        }
      }
      if (matchIdxPrev !== -1) break;
    }

    if (matchIdxPrev !== -1 && matchIdxCurr !== -1) {
      const prevMatchTurn = prevOverlapTurns[matchIdxPrev]!;
      const currMatchTurn = currOverlapTurns[matchIdxCurr]!;

      const mergedMatchIdx = merged.indexOf(prevMatchTurn);
      const currMatchIdx = nextChunk.indexOf(currMatchTurn);

      if (mergedMatchIdx !== -1 && currMatchIdx !== -1) {
        logger.info('gemini', `Merge matched turn at absolute ${prevMatchTurn.absSec}s: "${prevMatchTurn.text.slice(0, 20)}..."`);
        const prevPart = merged.slice(0, mergedMatchIdx + 1);
        const nextPart = nextChunk.slice(currMatchIdx + 1);
        merged = [...prevPart, ...nextPart];
        continue;
      }
    }

    logger.info('gemini', `Merge fallback to midpoint cut at ${offsetCurr + 5}s`);
    const midpoint = offsetCurr + 5;
    const prevPart = merged.filter(t => t.absSec < midpoint);
    const nextPart = nextChunk.filter(t => t.absSec >= midpoint);
    merged = [...prevPart, ...nextPart];
  }

  return merged;
}

function similarity(s1: string, s2: string): number {
  const set1 = new Set(s1.split(''));
  const set2 = new Set(s2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}
