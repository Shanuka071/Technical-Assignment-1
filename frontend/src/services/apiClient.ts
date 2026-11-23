import { env } from '@/config/env';
import type { FieldError, PaginationMeta } from '@/types/task';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface Envelope<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: { code: string; message: string; details?: FieldError[] };
}

/** Single entry point for HTTP calls: base URL, JSON handling and error normalisation. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<Envelope<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  // Only send Content-Type when there is a body: avoids needless CORS preflights on GET.
  if (init.body) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.');
  }

  if (response.status === 204) return { success: true, data: undefined as T };

  let body: Envelope<T> | null = null;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    /* response was not JSON */
  }

  if (!response.ok || !body?.success) {
    throw new ApiError(
      response.status,
      body?.error?.code ?? 'UNEXPECTED_RESPONSE',
      body?.error?.message ?? 'The server sent an unexpected response. Try again in a moment.',
      body?.error?.details ?? [],
    );
  }
  return body;
}
