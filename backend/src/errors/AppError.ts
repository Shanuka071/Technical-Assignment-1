export interface FieldError {
  field: string;
  message: string;
}

/** Base class for all errors that are safe to show to API clients. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    super(404, id ? `${resource} with id '${id}' was not found` : `${resource} not found`, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(details: FieldError[]) {
    super(422, 'Validation failed', 'VALIDATION_ERROR', details);
  }
}
