import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { changePasswordBody, loginBody } from "../validators/auth.validator.js";

export const authRoutes = Router()
  .post("/login", validate({ body: loginBody }), authController.login)
  .get("/me", authenticate, authController.me)
  .patch(
    "/password",
    authenticate,
    validate({ body: changePasswordBody }),
    authController.changePassword,
  );
