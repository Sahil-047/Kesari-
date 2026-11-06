import { ModulesEnum } from "./modules.enum.js";

export enum PermissionEnum {
  VIEW = "view",
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete",
}

export enum RoleEnum {
  ADMIN = "admin",
  EDITOR = "editor",
}

const ALL = Object.values(PermissionEnum);

/**
 * What each role may do per module. Admins manage everything; editors run the
 * whole studio except the team (users) module.
 */
export const RolePermissions: Record<RoleEnum, Partial<Record<ModulesEnum, PermissionEnum[]>>> = {
  [RoleEnum.ADMIN]: Object.fromEntries(Object.values(ModulesEnum).map((m) => [m, ALL])),
  [RoleEnum.EDITOR]: Object.fromEntries(
    Object.values(ModulesEnum)
      .filter((m) => m !== ModulesEnum.USER)
      .map((m) => [m, ALL]),
  ),
};
