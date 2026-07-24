import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../../config/constants";

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(HTTP_STATUS.UNAUTHORIZED, message, details);
  }
}
