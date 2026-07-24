import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../../config/constants";

export class BadRequestError extends ApiError {
  constructor(message = "Bad request", details?: unknown) {
    super(HTTP_STATUS.BAD_REQUEST, message, details);
  }
}
