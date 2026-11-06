import type { RequestHandler } from "express";
import AuthUseCase from "../../usecase/auth/authUseCase.js";
import { bodyOf, currentUser } from "../../util/helper/request.js";
import { sendNoContent, sendSuccess } from "../../util/helper/response.js";
import type { ChangePasswordInput, LoginInput } from "../../validator/authSchema.js";

class AuthController {
  login: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await AuthUseCase.login(bodyOf<LoginInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  me: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await AuthUseCase.me(currentUser(req).id));
    } catch (error) {
      next(error);
    }
  };

  changePassword: RequestHandler = async (req, res, next) => {
    try {
      await AuthUseCase.changePassword(currentUser(req).id, bodyOf<ChangePasswordInput>(req));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
