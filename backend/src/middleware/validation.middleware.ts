import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ValidationError } from "../shared/errors";

type RequestPart = "body" | "params" | "query";

/**
 * Generic validation middleware factory.
 *
 * Usage:
 *   router.post("/login", validate(loginSchema), login)
 *
 * By default it validates `req.body`. Pass `"params"` or `"query"` to
 * validate those instead. The parsed (and coerced/defaulted) value is
 * written back onto the request so controllers/services receive
 * clean, typed data — never raw, unvalidated input.
 */
export const validate =
  (schema: ZodObject, part: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      req[part] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        return next(new ValidationError("Validation failed", fieldErrors));
      }
      next(error);
    }
  };
