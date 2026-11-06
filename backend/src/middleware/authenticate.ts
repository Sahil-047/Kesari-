import type { RequestHandler } from "express";
import AuthUseCase from "../usecase/auth/authUseCase.js";
import CustomError from "../util/helper/customError.js";

/** Requires a valid `Authorization: Bearer <token>` and sets req.user. */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return next(CustomError.unauthorized());

  req.user = await AuthUseCase.resolveSession(token);
  next();
};
