import type { RequestHandler } from "express";
import type { ModulesEnum } from "../util/enum/modules.enum.js";
import { type PermissionEnum, RolePermissions } from "../util/enum/permission.enum.js";
import CustomError from "../util/helper/customError.js";

/**
 * Lets the request through only if the user's role holds `permission` on
 * `module`. Use after `authenticate`.
 */
export function authorize(module: ModulesEnum, permission: PermissionEnum): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(CustomError.unauthorized());
    const allowed = RolePermissions[req.user.role]?.[module] ?? [];
    if (!allowed.includes(permission)) return next(CustomError.forbidden());
    next();
  };
}
