/**
 * Cliente HTTP para hablar con el backend Hono.
 *
 * - baseURL `/api` → Vite proxy redirige a `http://localhost:3001/*`
 * - Devuelve el body parseado y tipado
 * - Lanza ApiError con código + mensaje si status >= 400
 *
 * Si en algún momento queremos SSE / AbortController / retry, este
 * es el único sitio que hay que tocar.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Query params que se serializan automáticamente. */
  query?: Record<string, string | number | boolean | undefined | null>;
}

const BASE_URL = '/api';

function buildUrl(path: string, query?: ApiOptions['query']): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullPath = BASE_URL + cleanPath;
  if (!query) return fullPath;

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) {
      qs.set(k, String(v));
    }
  }
  const qsStr = qs.toString();
  return qsStr ? `${fullPath}?${qsStr}` : fullPath;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const init: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers ?? {}),
    },
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(buildUrl(path, query), init);
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const errBody = (data ?? {}) as { error?: string; code?: number };
    throw new ApiError(
      res.status,
      errBody.code ?? res.status,
      errBody.error ?? `HTTP ${res.status}`,
    );
  }
  return data as T;
}
