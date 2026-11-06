import { Router } from "express";
import CraftController from "../../controller/craft/craftController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import { idParams, slugParams } from "../../validator/commonSchema.js";
import {
  createCraftSchema,
  listCraftsSchema,
  updateCraftSchema,
} from "../../validator/craftSchema.js";

const MODULE = ModulesEnum.CRAFT;

/** Mounted at /api: public /crafts and CMS /admin/crafts. */
const router = Router();

router.get(
  "/crafts",
  validateRequest({ schema: listCraftsSchema, type: PayloadType.QUERY }),
  CraftController.listPublishedCrafts,
);
router.get(
  "/crafts/:slug",
  validateRequest({ schema: slugParams, type: PayloadType.PARAMS }),
  CraftController.getPublishedCraftBySlug,
);

router.get(
  "/admin/crafts",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: listCraftsSchema, type: PayloadType.QUERY }),
  CraftController.listCrafts,
);
router.post(
  "/admin/crafts",
  authenticate,
  authorize(MODULE, PermissionEnum.CREATE),
  validateRequest({ schema: createCraftSchema }),
  CraftController.createCraft,
);
router.get(
  "/admin/crafts/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  CraftController.getCraft,
);
router.patch(
  "/admin/crafts/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: updateCraftSchema }),
  CraftController.updateCraft,
);
router.delete(
  "/admin/crafts/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.DELETE),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  CraftController.deleteCraft,
);

export default router;
