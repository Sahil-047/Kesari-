import * as yup from "yup";
import { RoleEnum } from "../util/enum/permission.enum.js";
import { paginationQuery } from "./commonSchema.js";

const role = () => yup.string().oneOf(Object.values(RoleEnum));

export const createUserSchema = yup.object({
  name: yup.string().trim().min(1).max(120).required(),
  email: yup.string().trim().lowercase().email().required(),
  password: yup.string().min(10, "Use at least 10 characters").max(128).required(),
  role: role().default(RoleEnum.EDITOR),
});

export const updateUserSchema = yup.object({
  name: yup.string().trim().min(1).max(120).optional(),
  role: role().optional(),
  isActive: yup.boolean().optional(),
  password: yup.string().min(10, "Use at least 10 characters").max(128).optional(),
});

export const listUsersSchema = paginationQuery;

export type CreateUserInput = yup.InferType<typeof createUserSchema>;
export type UpdateUserInput = yup.InferType<typeof updateUserSchema>;
export type ListUsersQuery = yup.InferType<typeof listUsersSchema>;
