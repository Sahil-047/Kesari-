import { z } from "zod";
import { ROLES } from "../types/auth.js";
import { paginationQuery } from "./common.validator.js";

export const createUserBody = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(10, "Use at least 10 characters").max(128),
  role: z.enum(ROLES).default("editor"),
});

export const updateUserBody = z
  .object({
    name: z.string().trim().min(1).max(120),
    role: z.enum(ROLES),
    isActive: z.boolean(),
    password: z.string().min(10).max(128),
  })
  .partial();

export const listUsersQuery = paginationQuery;

export type CreateUserInput = z.infer<typeof createUserBody>;
export type UpdateUserInput = z.infer<typeof updateUserBody>;
export type ListUsersQuery = z.infer<typeof listUsersQuery>;
