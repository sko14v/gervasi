/**
 * pdf.service.ts — genera PDFs a partir de HTML usando Playwright.
 *
 * Contrato:
 *   htmlToPdf(html, opts?) → { ok, buffer, size_bytes, duration_ms } o { ok: false, error, duration_ms }
 *
 * Notas operativas:
 *   - Solo importa `chromium` de Playwright, no el browser entero
 *     (más rápido y menos pesado).
 *   - El browser SIEMPRE se cierra en `finally` para no dejar
 *     procesos zombies.
 *   - Si Playwright/Chromium no están disponibles, devuelve error
 *     (no lanza) para que el caller lo reporte en logs.
 *   - Timeout total: 60 s (generación de PDF de una propuesta típica
 *     tarda < 5 s, así que 60 s es un margen generoso).
 */

import { chromium, type Browser } from 'playwright';
import { logger } from '../utils/logger.js';

export interface PdfOptions {
  /** Formato de página. Default: 'A4' */
  format?: 'A4' | 'Letter';
  /** Márgenes en mm. Default: { top: 20, right: 20, bottom: 20, left: 20 } */
  margin?: { top: number; right: number; bottom: number; left: number };
}

export type PdfResult =
  | {
      ok: true;
      buffer: Buffer;
      size_bytes: number;
      duration_ms: number;
    }
  | {
      ok: false;
      error: string;
      duration_ms: number;
    };

const DEFAULT_TIMEOUT_MS = 60_000;

let _browser: Browser | null = null;
let _launchingPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (_browser) {
    if (_browser.isConnected()) {
      return _browser;
    }
    try {
      await _browser.close();
    } catch {
      // ignore
    }
    _browser = null;
  }

  if (_launchingPromise) {
    return _launchingPromise;
  }

  _launchingPromise = chromium.launch({ headless: true }).then((b) => {
    _browser = b;
    _launchingPromise = null;
    return b;
  }).catch((err) => {
    _launchingPromise = null;
    throw err;
  });

  return _launchingPromise;
}

export async function closeBrowser(): Promise<void> {
  if (_browser) {
    try {
      await _browser.close();
    } catch {
      // ignore
    }
    _browser = null;
  }
  if (_launchingPromise) {
    try {
      const b = await _launchingPromise;
      await b.close();
    } catch {
      // ignore
    }
    _launchingPromise = null;
  }
}

export async function htmlToPdf(
  html: string,
  opts: PdfOptions = {},
): Promise<PdfResult> {
  const start = performance.now();
  const format = opts.format ?? 'A4';
  const margin = opts.margin ?? { top: 20, right: 20, bottom: 20, left: 20 };

  let browser: Browser;
  try {
    browser = await getBrowser();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const duration = Math.round(performance.now() - start);
    logger.error('pdf', `chromium.launch failed: ${message}`);
    return {
      ok: false,
      error: `playwright chromium no disponible: ${message}`,
      duration_ms: duration,
    };
  }

  let context;
  try {
    context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Cargamos el HTML directamente, sin red. `waitUntil: 'networkidle'`
      // es importante porque el HTML puede tener fuentes externas vía CDN.
      await page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: DEFAULT_TIMEOUT_MS,
      });

      const buffer = await page.pdf({
        format,
        printBackground: true,
        margin: {
          top: `${margin.top}mm`,
          right: `${margin.right}mm`,
          bottom: `${margin.bottom}mm`,
          left: `${margin.left}mm`,
        },
      });

      // page.pdf() devuelve Uint8Array → lo pasamos a Buffer.
      const buf = Buffer.from(buffer);

      const duration = Math.round(performance.now() - start);
      logger.info('pdf', `pdf generado: ${buf.length} bytes en ${duration}ms`);

      return {
        ok: true,
        buffer: buf,
        size_bytes: buf.length,
        duration_ms: duration,
      };
    } finally {
      await page.close().catch(() => {});
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const duration = Math.round(performance.now() - start);
    logger.error('pdf', `htmlToPdf failed: ${message}`);
    return { ok: false, error: message, duration_ms: duration };
  } finally {
    if (context) {
      try {
        await context.close();
      } catch (err) {
        logger.warn('pdf', `context.close failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
}
