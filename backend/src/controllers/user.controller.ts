import type { RequestHandler } from "express";
import { userService } from "../services/user.service.js";
import { currentUser, param, validatedBody, validatedQuery } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "../validators/user.validator.js";

export const userController = {
  list: (async (req, res) => {
    const { items, meta } = await userService.list(validatedQuery<ListUsersQuery>(req));
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await userService.get(param(req, "id")));
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const user = await userService.create(validatedBody<CreateUserInput>(req));
    sendSuccess(res, user, { status: 201 });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const user = await userService.update(
      param(req, "id"),
      currentUser(req).id,
      validatedBody<UpdateUserInput>(req),
    );
    sendSuccess(res, user);
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await userService.remove(param(req, "id"), currentUser(req).id);
    sendNoContent(res);
  }) satisfies RequestHandler,
};
