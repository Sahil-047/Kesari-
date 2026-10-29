import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import { idParams } from "../validators/common.validator.js";
import {
  createUserBody,
  listUsersQuery,
  updateUserBody,
} from "../validators/user.validator.js";

/** /admin/users — admin role only. */
export const userAdminRoutes = Router()
  .get("/", validate({ query: listUsersQuery }), userController.list)
  .post("/", validate({ body: createUserBody }), userController.create)
  .get("/:id", validate({ params: idParams }), userController.get)
  .patch("/:id", validate({ params: idParams, body: updateUserBody }), userController.update)
  .delete("/:id", validate({ params: idParams }), userController.remove);
