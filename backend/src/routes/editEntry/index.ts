import { Router } from "express";
import EditEntryController from "../../controller/editEntry/editEntryController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import { idParams } from "../../validator/commonSchema.js";
import {
  createEditEntrySchema,
  reorderEditSchema,
  updateEditEntrySchema,
} from "../../validator/editEntrySchema.js";

const MODULE = ModulesEnum.EDIT;

/** Mounted at /api: public /edit and CMS /admin/edit. */
const router = Router();

router.get("/edit", EditEntryController.listPublicEdit);

router.get(
  "/admin/edit",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  EditEntryController.listEdit,
);
router.post(
  "/admin/edit",
  authenticate,
  authorize(MODULE, PermissionEnum.CREATE),
  validateRequest({ schema: createEditEntrySchema }),
  EditEntryController.createEntry,
);
// Before /:id so "order" is not read as an id.
router.put(
  "/admin/edit/order",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: reorderEditSchema }),
  EditEntryController.reorderEdit,
);
router.get(
  "/admin/edit/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  EditEntryController.getEntry,
);
router.patch(
  "/admin/edit/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: updateEditEntrySchema }),
  EditEntryController.updateEntry,
);
router.delete(
  "/admin/edit/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.DELETE),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  EditEntryController.deleteEntry,
);

export default router;
