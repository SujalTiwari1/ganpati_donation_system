import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../../config/constants";

export class InternalServerError extends ApiError {
  constructor(message = "Internal server error", details?: unknown) {
    // isOperational = false: this represents an unexpected failure
    // (e.g. a bug or unhandled infra issue), not a predictable
    // business-rule rejection.
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, details, false);
  }
}
