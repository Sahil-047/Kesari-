import { Router } from "express";
import AuthController from "../../controller/auth/authController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { changePasswordSchema, loginSchema } from "../../validator/authSchema.js";

/** Mounted at /api/auth. */
const router = Router();

router.post("/login", validateRequest({ schema: loginSchema }), AuthController.login);
router.get("/me", authenticate, AuthController.me);
router.patch(
  "/password",
  authenticate,
  validateRequest({ schema: changePasswordSchema }),
  AuthController.changePassword,
);

export default router;
