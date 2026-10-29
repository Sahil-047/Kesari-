import type { RequestHandler } from "express";
import type { Role } from "../types/auth.js";
import { ApiError } from "../utils/ApiError.js";

/** Allows the request through only for the given roles. Use after `authenticate`. */
export function authorize(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}
