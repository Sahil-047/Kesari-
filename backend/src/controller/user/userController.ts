import type { RequestHandler } from "express";
import UserUseCase from "../../usecase/user/userUseCase.js";
import { bodyOf, currentUser, paramOf, queryOf } from "../../util/helper/request.js";
import { sendCreated, sendNoContent, sendPage, sendSuccess } from "../../util/helper/response.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "../../validator/userSchema.js";

class UserController {
  listUsers: RequestHandler = async (req, res, next) => {
    try {
      sendPage(res, await UserUseCase.listUsers(queryOf<ListUsersQuery>(req)));
    } catch (error) {
      next(error);
    }
  };

  getUser: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await UserUseCase.getUser(paramOf(req, "id")));
    } catch (error) {
      next(error);
    }
  };

  createUser: RequestHandler = async (req, res, next) => {
    try {
      sendCreated(res, await UserUseCase.createUser(bodyOf<CreateUserInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  updateUser: RequestHandler = async (req, res, next) => {
    try {
      const user = await UserUseCase.updateUser(
        paramOf(req, "id"),
        currentUser(req).id,
        bodyOf<UpdateUserInput>(req),
      );
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  deleteUser: RequestHandler = async (req, res, next) => {
    try {
      await UserUseCase.deleteUser(paramOf(req, "id"), currentUser(req).id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
