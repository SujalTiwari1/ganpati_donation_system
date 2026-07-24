/**
 * Base class for all operational (expected) errors in the application.
 * `isOperational: true` lets the global error handler distinguish
 * "safe to show the message to the client" errors from unexpected
 * programming errors/bugs, which should never leak details.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
