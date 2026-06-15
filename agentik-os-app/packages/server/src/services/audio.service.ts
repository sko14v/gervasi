import path from 'node:path';
import { promises as fs } from 'node:fs';
import { FFMPEG_BIN } from '../config/models.js';
import { logger } from '../utils/logger.js';
import { execFileP } from '../utils/process-manager.js';

function resolveFfprobe(): string {
  const bin = FFMPEG_BIN;
  // Si es un path absoluto, reemplazamos ffmpeg por ffprobe en el mismo directorio
  if (path.isAbsolute(bin)) {
    const dir = path.dirname(bin);
    const base = path.basename(bin);
    const ffprobeBase = base.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1');
    return path.join(dir, ffprobeBase);
  }
  // Si es un comando en PATH (ej: 'ffmpeg'), devolvemos 'ffprobe'
  return bin.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1');
}

/**
 * Obtener la duración en segundos del audio usando ffprobe o ffmpeg.
 */
export async function getAudioDuration(filePath: string): Promise<number> {
  const probeBin = resolveFfprobe();
  
  try {
    const { stdout } = await execFileP(probeBin, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ], { timeout: 10000 });
    const duration = parseFloat(stdout.trim());
    if (!isNaN(duration)) {
      return duration;
    }
  } catch (err) {
    logger.warn('audio', `ffprobe falló: ${err instanceof Error ? err.message : String(err)}. Intentando con ffmpeg...`);
  }

  // Fallback: parsear la salida de ffmpeg -i
  try {
    // ffmpeg -i sin output file retorna código de error, lo capturamos
    const res = await execFileP(FFMPEG_BIN, ['-i', filePath], { timeout: 10000 }).catch((e) => e);
    if (res instanceof Error) {
      throw res;
    }
    const output = res.stderr || res.stdout || '';
    const match = output.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
    if (match) {
      const hours = parseInt(match[1]!, 10);
      const minutes = parseInt(match[2]!, 10);
      const seconds = parseInt(match[3]!, 10);
      const hundredths = parseInt(match[4]!, 10);
      return hours * 3600 + minutes * 60 + seconds + hundredths / 100;
    }
  } catch (err) {
    logger.error('audio', `no se pudo obtener la duración: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  throw new Error(`No se pudo determinar la duración de ${filePath}`);
}

/**
 * Divide el audio en chunks de 15 minutos (900s) con 10s de solapamiento.
 * Formato de salida: MP3 mono 32kbps (bajo peso para transcripción).
 */
export async function splitAudio(filePath: string, outputDir: string): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });
  const duration = await getAudioDuration(filePath);
  
  const chunkSize = 900; // 15 minutos en segundos
  const overlap = 10;    // 10 segundos
  const chunkPaths: string[] = [];
  
  // Si dura menos de 15 min y 10 seg, no hace falta trocear, se procesa entero.
  if (duration <= chunkSize + overlap) {
    const filename = `chunk_1_${path.basename(filePath, path.extname(filePath))}.mp3`;
    const dest = path.join(outputDir, filename);
    
    // Re-codificar a MP3 mono ligero para homogeneizar la entrada a Gemini.
    logger.info('audio', `Audio corto (${Math.round(duration)}s) → convirtiendo a MP3 ligero`);
    await execFileP(FFMPEG_BIN, [
      '-i', filePath,
      '-acodec', 'libmp3lame',
      '-ac', '1',
      '-b:a', '32k',
      '-y',
      dest
    ], { timeout: 60000 });
    return [dest];
  }
  
  const baseName = path.basename(filePath, path.extname(filePath));
  let chunkIdx = 1;
  
  for (let start = 0; start < duration; start += chunkSize) {
    // Si la parte restante es insignificante (ej: menos de 5 seg), no creamos otro chunk
    if (duration - start < 5) {
      break;
    }
    
    const end = Math.min(start + chunkSize + overlap, duration);
    const chunkDuration = end - start;
    const dest = path.join(outputDir, `${baseName}_chunk_${chunkIdx}.mp3`);
    
    logger.info('audio', `Creando chunk ${chunkIdx}: start=${start}s, duration=${chunkDuration}s`);
    
    await execFileP(FFMPEG_BIN, [
      '-ss', String(start),
      '-t', String(chunkDuration),
      '-i', filePath,
      '-acodec', 'libmp3lame',
      '-ac', '1',
      '-b:a', '32k',
      '-y',
      dest
    ], { timeout: 120000 });
    
    chunkPaths.push(dest);
    chunkIdx++;
  }
  
  return chunkPaths;
}
