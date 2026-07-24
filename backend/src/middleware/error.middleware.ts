import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../shared/errors/ApiError";
import { InternalServerError } from "../shared/errors/InternalServerError";
import { HTTP_STATUS } from "../config/constants";
import { env } from "../config/env";
import { logger } from "../config/logger";

/**
 * Translates known Prisma error codes into our own ApiError types so
 * we never leak raw Prisma/SQL error internals to the client.
 * https://www.prisma.io/docs/orm/reference/error-reference
 */
function normalizePrismaError(error: Prisma.PrismaClientKnownRequestError): ApiError {
  switch (error.code) {
    case "P2002": {
      const target = (error.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return new ApiError(HTTP_STATUS.CONFLICT, `A record with this ${target} already exists`);
    }
    case "P2025":
      return new ApiError(HTTP_STATUS.NOT_FOUND, "Requested resource was not found");
    case "P2003":
      return new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid reference to a related record");
    default:
      return new InternalServerError("Database error occurred");
  }
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return normalizePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid data provided to the database");
  }

  if (error instanceof Error) {
    return new InternalServerError(
      env.NODE_ENV === "production" ? "Internal server error" : error.message
    );
  }

  return new InternalServerError("An unknown error occurred");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const apiError = normalizeError(err);

  const logPayload = {
    method: req.method,
    path: req.originalUrl,
    statusCode: apiError.statusCode,
    ip: req.ip,
  };

  if (apiError.isOperational) {
    logger.warn(`${apiError.message}`, logPayload);
  } else {
    // Unexpected/programming errors get logged with full stack trace.
    logger.error(apiError.stack ?? apiError.message, { ...logPayload, original: err });
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.details ? { errors: apiError.details } : {}),
    ...(env.NODE_ENV !== "production" && !apiError.isOperational
      ? { stack: apiError.stack }
      : {}),
  });
}
