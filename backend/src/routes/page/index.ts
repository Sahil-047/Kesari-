import { Router } from "express";
import PageController from "../../controller/page/pageController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import { pageSlugParams, saveDraftSchema } from "../../validator/pageSchema.js";

const MODULE = ModulesEnum.PAGE;

/** Mounted at /api: public /pages/:slug, CMS drafts and publishing under /admin/pages. */
const router = Router();

router.get(
  "/pages/:slug",
  validateRequest({ schema: pageSlugParams, type: PayloadType.PARAMS }),
  PageController.getPublishedPage,
);

router.get(
  "/admin/pages",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  PageController.listPages,
);
router.get(
  "/admin/pages/:slug",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: pageSlugParams, type: PayloadType.PARAMS }),
  PageController.getPage,
);
router.put(
  "/admin/pages/:slug",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: pageSlugParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: saveDraftSchema }),
  PageController.saveDraft,
);
router.post(
  "/admin/pages/:slug/publish",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: pageSlugParams, type: PayloadType.PARAMS }),
  PageController.publishPage,
);

export default router;
