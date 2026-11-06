import { Router } from "express";
import MediaController from "../../controller/media/mediaController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { uploadFile } from "../../middleware/uploadFile.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import { idParams } from "../../validator/commonSchema.js";
import {
  listMediaSchema,
  updateMediaSchema,
  uploadMediaSchema,
} from "../../validator/mediaSchema.js";

const MODULE = ModulesEnum.MEDIA;

/** Mounted at /api: the S3-backed media library under /admin/media. */
const router = Router();

router.get(
  "/admin/media",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: listMediaSchema, type: PayloadType.QUERY }),
  MediaController.listMedia,
);
router.post(
  "/admin/media",
  authenticate,
  authorize(MODULE, PermissionEnum.CREATE),
  uploadFile.single("file"),
  validateRequest({ schema: uploadMediaSchema }),
  MediaController.uploadMedia,
);
router.get(
  "/admin/media/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  MediaController.getMedia,
);
router.patch(
  "/admin/media/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: updateMediaSchema }),
  MediaController.updateMedia,
);
router.delete(
  "/admin/media/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.DELETE),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  MediaController.deleteMedia,
);

/** Root-mounted media proxy: GET /img/media/2026/11/….png → S3 GetObject. */
export const imgRouter = Router().get("/img/*key", MediaController.serveObject);

export default router;
