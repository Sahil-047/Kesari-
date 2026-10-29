import type { RequestHandler } from "express";
import { authService } from "../services/auth.service.js";
import { currentUser, validatedBody } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type { ChangePasswordInput, LoginInput } from "../validators/auth.validator.js";

export const authController = {
  login: (async (req, res) => {
    sendSuccess(res, await authService.login(validatedBody<LoginInput>(req)));
  }) satisfies RequestHandler,

  me: (async (req, res) => {
    sendSuccess(res, await authService.me(currentUser(req).id));
  }) satisfies RequestHandler,

  changePassword: (async (req, res) => {
    await authService.changePassword(currentUser(req).id, validatedBody<ChangePasswordInput>(req));
    sendNoContent(res);
  }) satisfies RequestHandler,
};
