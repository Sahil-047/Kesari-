import { Router } from "express";
import EnquiryController from "../../controller/enquiry/enquiryController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import { idParams } from "../../validator/commonSchema.js";
import {
  createEnquirySchema,
  listEnquiriesSchema,
  updateEnquirySchema,
} from "../../validator/enquirySchema.js";

const MODULE = ModulesEnum.ENQUIRY;

/** Mounted at /api: the public Atelier form posts to /enquiries. */
const router = Router();

router.post(
  "/enquiries",
  validateRequest({ schema: createEnquirySchema }),
  EnquiryController.submitEnquiry,
);

router.get(
  "/admin/enquiries",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: listEnquiriesSchema, type: PayloadType.QUERY }),
  EnquiryController.listEnquiries,
);
router.get(
  "/admin/enquiries/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  EnquiryController.getEnquiry,
);
router.patch(
  "/admin/enquiries/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: updateEnquirySchema }),
  EnquiryController.updateEnquiry,
);
router.delete(
  "/admin/enquiries/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.DELETE),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  EnquiryController.deleteEnquiry,
);

export default router;
