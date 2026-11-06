import { HttpStatusCode } from "axios";
import type { ErrorRequestHandler, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import { ValidationError } from "yup";
import logger from "../lib/winston/logger.js";
import CustomError from "../util/helper/customError.js";

/** Maps known failures to a client-facing CustomError; anything else stays unknown. */
function toCustomError(error: unknown): CustomError | undefined {
  if (error instanceof CustomError) return error;

  if (error instanceof ValidationError) {
    const issues = error.inner.length ? error.inner : [error];
    // One message per field: an empty required string fails both min() and required().
    const byPath = new Map<string, string>();
    for (const issue of issues) {
      const path = issue.path ?? "";
      if (!byPath.has(path)) byPath.set(path, issue.message);
    }
    return new CustomError(
      "Validation failed",
      HttpStatusCode.BadRequest,
      [...byPath].map(([path, message]) => ({ path, message })),
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return new CustomError(`Invalid ${error.path}`);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new CustomError(
      "Validation failed",
      HttpStatusCode.BadRequest,
      Object.values(error.errors).map((e) => ({ path: e.path, message: e.message })),
    );
  }

  // Duplicate key from a unique index.
  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    const fields = Object.keys((error as { keyValue?: object }).keyValue ?? {});
    return CustomError.conflict(`Already exists: ${fields.join(", ") || "duplicate value"}`);
  }

  if (error instanceof multer.MulterError) {
    return new CustomError(
      error.message,
      error.code === "LIMIT_FILE_SIZE" ? HttpStatusCode.PayloadTooLarge : HttpStatusCode.BadRequest,
    );
  }

  if (error instanceof jwt.TokenExpiredError) return CustomError.unauthorized("Session expired");
  if (error instanceof jwt.JsonWebTokenError) return CustomError.unauthorized("Invalid token");

  // Malformed JSON body.
  if (error instanceof SyntaxError && "body" in error) {
    return new CustomError("Malformed JSON body");
  }

  return undefined;
}

/** Registered last: answers every failure as { success: false, error }. */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const known = toCustomError(error);

  if (!known) {
    logger.error("Unhandled error", {
      requestId: req.requestId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(HttpStatusCode.InternalServerError).json({
      success: false,
      error: { message: "Internal server error", requestId: req.requestId },
    });
    return;
  }

  res.status(known.statusCode).json({
    success: false,
    error: {
      message: known.message,
      ...(known.details !== undefined && { details: known.details }),
      requestId: req.requestId,
    },
  });
};

export const notFound: RequestHandler = (req, _res, next) => {
  next(new CustomError(`No route for ${req.method} ${req.originalUrl}`, HttpStatusCode.NotFound));
};
