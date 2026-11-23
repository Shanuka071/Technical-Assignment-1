import type { Response } from 'express';

export interface ApiSuccess<T, M = undefined> {
  success: true;
  data: T;
  meta?: M;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export function sendSuccess<T, M extends object | undefined = undefined>(
  res: Response,
  data: T,
  status = 200,
  meta?: M,
): void {
  const body: ApiSuccess<T, M> = { success: true, data, ...(meta ? { meta } : {}) };
  res.status(status).json(body);
}

export function sendFailure(res: Response, status: number, code: string, message: string, details?: unknown): void {
  const body: ApiFailure = { success: false, error: { code, message, ...(details ? { details } : {}) } };
  res.status(status).json(body);
}
