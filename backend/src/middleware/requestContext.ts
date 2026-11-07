import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import logger from "../lib/winston/logger.js";

const SLOW_MS = 1500;

/** One short request id for logs (full UUID still goes out on the response header). */
function shortId(id: string) {
  return id.slice(0, 8);
}

/**
 * Tags each request with an id and logs when the response finishes.
 * Skips CORS preflights; media hits stay quiet unless slow or failing.
 */
export const requestContext: RequestHandler = (req, res, next) => {
  const started = performance.now();
  req.requestId = req.get("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", req.requestId);

  res.on("finish", () => {
    if (req.method === "OPTIONS") return;

    const durationMs = Math.round(performance.now() - started);
    const status = res.statusCode;
    const path = req.originalUrl;
    const isMedia = path.startsWith("/img/");
    const failed = status >= 400;
    const slow = durationMs >= SLOW_MS;

    // Healthy image proxies are noise in the terminal.
    if (isMedia && !failed && !slow) {
      logger.debug(`${req.method} ${path}`, {
        status,
        durationMs,
        requestId: shortId(req.requestId!),
      });
      return;
    }

    const level = failed ? (status >= 500 ? "error" : "warn") : slow ? "warn" : "info";
    logger.log(level, `${req.method} ${path} → ${status}`, {
      durationMs,
      requestId: shortId(req.requestId!),
      ...(req.user?.id && { userId: req.user.id }),
      ...(slow && { slow: true }),
    });
  });

  next();
};
