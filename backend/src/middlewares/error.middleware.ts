import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { sendFailure } from '../utils/apiResponse';

export const notFoundHandler: RequestHandler = (req, res) => {
  sendFailure(res, 404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} does not exist`);
};

interface HttpLikeError {
  status?: number;
  expose?: boolean;
  type?: string;
  code?: string;
}

/** Single place where every error becomes a consistent JSON response. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return sendFailure(res, err.statusCode, err.code, err.message, err.details);
  }

  const e = (err ?? {}) as HttpLikeError;

  // Errors raised by express.json(): malformed JSON, payload too large, ...
  if (e.type === 'entity.parse.failed') {
    return sendFailure(res, 400, 'INVALID_JSON', 'Request body contains malformed JSON');
  }
  if (e.type === 'entity.too.large') {
    return sendFailure(res, 413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  }

  // Prisma: record to update/delete does not exist (race between check and write)
  if (e.code === 'P2025') {
    return sendFailure(res, 404, 'NOT_FOUND', 'The requested resource was not found');
  }

  console.error(err);
  const message = env.isProduction
    ? 'Something went wrong. Please try again later.'
    : err instanceof Error
      ? err.message
      : 'Unexpected error';
  return sendFailure(res, 500, 'INTERNAL_ERROR', message);
};
