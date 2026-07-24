import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../../config/constants";

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", details?: unknown) {
    super(HTTP_STATUS.NOT_FOUND, message, details);
  }
}
