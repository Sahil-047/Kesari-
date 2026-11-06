import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().trim().lowercase().email("Invalid email").required(),
  password: yup.string().min(1, "Password is required").required("Password is required"),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().min(1).required(),
  newPassword: yup.string().min(10, "Use at least 10 characters").max(128).required(),
});

export type LoginInput = yup.InferType<typeof loginSchema>;
export type ChangePasswordInput = yup.InferType<typeof changePasswordSchema>;
