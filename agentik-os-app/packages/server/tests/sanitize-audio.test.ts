import { describe, it, expect } from 'vitest';
import path from 'node:path';

const ALLOWED_AUDIO_EXTS = new Set(['.mp3', '.mpeg', '.wav', '.m4a', '.ogg', '.webm']);

function sanitizeAudioFileName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const safeExt = ALLOWED_AUDIO_EXTS.has(ext) ? ext : '.mp3';
  const base = path.basename(name, path.extname(name));
  const sanitizedBase = base.replace(/[^A-Za-z0-9._-]/g, '_');
  if (!sanitizedBase || sanitizedBase.startsWith('.') || sanitizedBase.includes('..')) {
    throw new Error(`nombre de archivo no válido: ${name}`);
  }
  return `${sanitizedBase}${safeExt}`;
}

describe('sanitizeAudioFileName', () => {
  it('sanitizes special chars', () => {
    expect(sanitizeAudioFileName('mi audio (1).mp3')).toBe('mi_audio__1_.mp3');
  });

  it('allows safe names', () => {
    expect(sanitizeAudioFileName('recording.wav')).toBe('recording.wav');
  });

  it('defaults unknown ext to mp3', () => {
    expect(sanitizeAudioFileName('song.aac')).toBe('song.mp3');
  });

  it('lowercases ext', () => {
    expect(sanitizeAudioFileName('SONG.MP3')).toBe('SONG.mp3');
  });

  it('throws on invalid base', () => {
    expect(() => sanitizeAudioFileName('..hidden.mp3')).toThrow();
  });
});
