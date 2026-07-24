import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps an async Express handler so any rejected promise (thrown
 * error) is automatically forwarded to `next()`, and therefore to the
 * global error middleware. This is what allows controllers to simply
 * `throw new SomeApiError(...)` instead of using try/catch blocks.
 */
export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
