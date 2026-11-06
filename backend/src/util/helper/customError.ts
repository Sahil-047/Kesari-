import { HttpStatusCode } from "axios";

export type ErrorDetail = { path: string; message: string };

/** An expected, client-facing failure. Anything else is answered as a 500. */
export default class CustomError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = HttpStatusCode.BadRequest,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "CustomError";
  }

  static notFound(resource = "Resource") {
    return new CustomError(`${resource} not found`, HttpStatusCode.NotFound);
  }

  static unauthorized(message = "Authentication required") {
    return new CustomError(message, HttpStatusCode.Unauthorized);
  }

  static forbidden(message = "You do not have permission to do this") {
    return new CustomError(message, HttpStatusCode.Forbidden);
  }

  static conflict(message: string) {
    return new CustomError(message, HttpStatusCode.Conflict);
  }
}
