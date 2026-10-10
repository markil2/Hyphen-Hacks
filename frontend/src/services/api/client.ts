/**
 * The one place the app talks HTTP to the Nurture backend.
 *
 * - Base URL comes from EXPO_PUBLIC_API_URL (e.g. http://localhost:8000/api).
 * - Unwraps the backend's `{ success, data }` envelope.
 * - Turns every failure into an ApiError with a calm, user-facing message.
 * - Never logs request or response bodies (they can contain private care data).
 */

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/$/, '');

const TIMEOUT_MS = 12_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const friendly: Record<string, string> = {
  NETWORK: 'Can’t reach Nurture right now. Check your connection and try again.',
  TIMEOUT: 'Nurture is taking too long to respond. Please try again.',
  RATE_LIMITED: 'That was a lot of requests in a short time. Wait a moment and try again.',
  VALIDATION_ERROR: 'Some details don’t look right. Please check and try again.',
  UNAUTHORIZED: 'You’re signed out. Please sign in again.',
  SLEEP_ALREADY_ACTIVE: 'A sleep session is already running.',
  BAD_RESPONSE: 'Nurture sent back something unexpected. Please try again.',
};

function messageFor(code: string, status: number, serverMessage?: string) {
  if (friendly[code]) return friendly[code];
  if (status === 429) return friendly.RATE_LIMITED;
  if (status === 401) return friendly.UNAUTHORIZED;
  if (status >= 500) return 'Something went wrong on our side. Please try again in a moment.';
  if (status === 404) return 'That item couldn’t be found. It may have been removed.';
  return serverMessage || 'Something went wrong. Please try again.';
}

type Query = Record<string, string | number | undefined | null>;

function buildUrl(path: string, query?: Query) {
  const url = `${API_URL}/${path.replace(/^\//, '')}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `${url}?${params.join('&')}` : url;
}

export async function api<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; body?: unknown; query?: Query } = {},
): Promise<T> {
  if (!API_URL) throw new ApiError('The Nurture server isn’t configured.', 0, 'NOT_CONFIGURED');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers: { Accept: 'application/json', ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    throw new ApiError(friendly[aborted ? 'TIMEOUT' : 'NETWORK'], 0, aborted ? 'TIMEOUT' : 'NETWORK');
  } finally {
    clearTimeout(timer);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(messageFor('BAD_RESPONSE', response.status), response.status, 'BAD_RESPONSE');
  }

  const envelope = payload as { success?: boolean; data?: unknown; error?: { code?: string; message?: string } };
  if (!response.ok || envelope.success === false) {
    const code = envelope.error?.code ?? (response.status === 429 ? 'RATE_LIMITED' : 'HTTP_ERROR');
    throw new ApiError(messageFor(code, response.status, envelope.error?.message), response.status, code);
  }
  if (typeof envelope !== 'object' || envelope === null || !('data' in envelope)) {
    throw new ApiError(friendly.BAD_RESPONSE, response.status, 'BAD_RESPONSE');
  }
  return envelope.data as T;
}

/** Paginated list payload: `{ items, pagination }`. */
export interface Page<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
