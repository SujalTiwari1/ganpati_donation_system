import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../../config/constants";

export class ConflictError extends ApiError {
  constructor(message = "Resource already exists", details?: unknown) {
    super(HTTP_STATUS.CONFLICT, message, details);
  }
}
