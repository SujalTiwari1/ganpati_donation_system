import { Response } from "express";
import { HTTP_STATUS } from "../../config/constants";

interface ApiResponseOptions<T> {
  statusCode?: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

/**
 * Every successful controller response is sent through this helper so
 * the response shape is 100% consistent across the whole API:
 *
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... },
 *   "meta": { ... }   // optional (pagination, counts, etc.)
 * }
 */
export class ApiResponse {
  static send<T>(res: Response, options: ApiResponseOptions<T>): Response {
    const { statusCode = HTTP_STATUS.OK, message, data, meta } = options;

    return res.status(statusCode).json({
      success: true,
      message,
      data: data ?? null,
      ...(meta ? { meta } : {}),
    });
  }

  static success<T>(
    res: Response,
    data: T,
    message: string,
    statusCode?: number,
    meta?: Record<string, unknown>
  ): Response {
    return this.send(res, { statusCode: statusCode ?? HTTP_STATUS.OK, message, data, meta });
  }

  static created<T>(
    res: Response,
    data: T,
    message: string,
    meta?: Record<string, unknown>
  ): Response {
    return this.success(res, data, message, HTTP_STATUS.CREATED, meta);
  }

  static updated<T>(
    res: Response,
    data: T,
    message: string,
    meta?: Record<string, unknown>
  ): Response {
    return this.success(res, data, message, HTTP_STATUS.OK, meta);
  }

  static deleted<T>(
    res: Response,
    data: T,
    message: string,
    meta?: Record<string, unknown>
  ): Response {
    return this.success(res, data, message, HTTP_STATUS.OK, meta);
  }

  static restored<T>(
    res: Response,
    data: T,
    message: string,
    meta?: Record<string, unknown>
  ): Response {
    return this.success(res, data, message, HTTP_STATUS.OK, meta);
  }
}
