import type { Request, RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '../errors/AppError';

type RequestSource = 'body' | 'query' | 'params';

/**
 * Validates (and sanitises) part of the request against a zod schema.
 * On success the parsed value replaces the raw one, so downstream code only ever
 * sees typed, trimmed and defaulted data. On failure a ValidationError is raised
 * with one entry per invalid field.
 */
export const validate =
  (schema: ZodTypeAny, source: RequestSource = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new ValidationError(
          result.error.issues.map((issue) => ({
            field: issue.path.join('.') || source,
            message: issue.message,
          })),
        ),
      );
    }
    (req as Request & Record<RequestSource, unknown>)[source] = result.data;
    return next();
  };
