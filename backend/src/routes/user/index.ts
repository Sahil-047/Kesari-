import { Router } from "express";
import UserController from "../../controller/user/userController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import { idParams } from "../../validator/commonSchema.js";
import {
  createUserSchema,
  listUsersSchema,
  updateUserSchema,
} from "../../validator/userSchema.js";

const MODULE = ModulesEnum.USER;

/** Mounted at /api: the team under /admin/users (admin role only, via RBAC). */
const router = Router();

router.get(
  "/admin/users",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: listUsersSchema, type: PayloadType.QUERY }),
  UserController.listUsers,
);
router.post(
  "/admin/users",
  authenticate,
  authorize(MODULE, PermissionEnum.CREATE),
  validateRequest({ schema: createUserSchema }),
  UserController.createUser,
);
router.get(
  "/admin/users/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  UserController.getUser,
);
router.patch(
  "/admin/users/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: updateUserSchema }),
  UserController.updateUser,
);
router.delete(
  "/admin/users/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.DELETE),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  UserController.deleteUser,
);

export default router;
