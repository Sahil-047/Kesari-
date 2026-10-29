import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logger } from "../utils/logger.js";

/** Tags each request with an id and logs one line when the response finishes. */
export const requestContext: RequestHandler = (req, res, next) => {
  const started = performance.now();
  req.requestId = req.get("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", req.requestId);

  res.on("finish", () => {
    logger.info("request", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(performance.now() - started),
      userId: req.user?.id,
    });
  });

  next();
};
