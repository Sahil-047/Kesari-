import type { ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

/** Maps known failures to a client-facing ApiError; anything else stays unknown. */
function toApiError(error: unknown): ApiError | undefined {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return ApiError.badRequest(
      "Validation failed",
      error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${error.path}`);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return ApiError.badRequest(
      "Validation failed",
      Object.values(error.errors).map((e) => ({ path: e.path, message: e.message })),
    );
  }

  // Duplicate key from a unique index.
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    const fields = Object.keys((error as { keyValue?: object }).keyValue ?? {});
    return ApiError.conflict(`Already exists: ${fields.join(", ") || "duplicate value"}`);
  }

  if (error instanceof multer.MulterError) {
    return new ApiError(error.code === "LIMIT_FILE_SIZE" ? 413 : 400, error.message);
  }

  if (error instanceof jwt.TokenExpiredError) return ApiError.unauthorized("Session expired");
  if (error instanceof jwt.JsonWebTokenError) return ApiError.unauthorized("Invalid token");

  // Malformed JSON body.
  if (error instanceof SyntaxError && "body" in error) {
    return ApiError.badRequest("Malformed JSON body");
  }

  return undefined;
}

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const apiError = toApiError(error);

  if (!apiError) {
    logger.error("Unhandled error", error, { requestId: req.requestId });
    res.status(500).json({
      success: false,
      error: { message: "Internal server error", requestId: req.requestId },
    });
    return;
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      message: apiError.message,
      ...(apiError.details !== undefined && { details: apiError.details }),
      requestId: req.requestId,
    },
  });
};
