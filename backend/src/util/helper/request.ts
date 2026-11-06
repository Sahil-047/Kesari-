import type { Request } from "express";
import CustomError from "./customError.js";

/** Typed access to values already validated by `validateRequest`. */
export const bodyOf = <T>(req: Request): T => req.body as T;
export const queryOf = <T>(req: Request): T => req.query as unknown as T;

/** The signed-in user; routes using this sit behind `authenticate`. */
export function currentUser(req: Request) {
  if (!req.user) throw CustomError.unauthorized();
  return req.user;
}

export function paramOf(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") throw new CustomError(`Missing ${name}`);
  return value;
}
