import type { RequestHandler } from "express";
import { authService } from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";

/** Requires a valid `Authorization: Bearer <token>` and sets req.user. */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw ApiError.unauthorized();

  req.user = await authService.verifyToken(token);
  next();
};
