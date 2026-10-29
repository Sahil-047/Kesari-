import { z } from "zod";

export const loginBody = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordBody = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10, "Use at least 10 characters").max(128),
});

export type LoginInput = z.infer<typeof loginBody>;
export type ChangePasswordInput = z.infer<typeof changePasswordBody>;
