import type { Request } from "express";
import { ApiError } from "./ApiError.js";

/** Typed access to values already parsed by the `validate` middleware. */
export const validatedBody = <T>(req: Request): T => req.body as T;
export const validatedQuery = <T>(req: Request): T => req.query as unknown as T;

/** The signed-in user; routes using this sit behind `authenticate`. */
export function currentUser(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") throw ApiError.badRequest(`Missing ${name}`);
  return value;
}
