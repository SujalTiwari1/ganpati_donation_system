import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../../config/constants";

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", details?: unknown) {
    super(HTTP_STATUS.FORBIDDEN, message, details);
  }
}
