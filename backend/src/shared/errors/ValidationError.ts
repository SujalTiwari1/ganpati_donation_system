import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../../config/constants";

export class ValidationError extends ApiError {
  constructor(message = "Validation failed", details?: unknown) {
    super(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, details);
  }
}
