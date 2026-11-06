import { Router } from "express";
import CollectionController from "../../controller/collection/collectionController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import {
  createCollectionSchema,
  listCollectionsSchema,
  updateCollectionSchema,
} from "../../validator/collectionSchema.js";
import { idParams, slugParams } from "../../validator/commonSchema.js";

const MODULE = ModulesEnum.COLLECTION;

/** Mounted at /api: public /collections and CMS /admin/collections. */
const router = Router();

router.get(
  "/collections",
  validateRequest({ schema: listCollectionsSchema, type: PayloadType.QUERY }),
  CollectionController.listPublishedCollections,
);
router.get(
  "/collections/:slug",
  validateRequest({ schema: slugParams, type: PayloadType.PARAMS }),
  CollectionController.getPublishedCollectionBySlug,
);

router.get(
  "/admin/collections",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: listCollectionsSchema, type: PayloadType.QUERY }),
  CollectionController.listCollections,
);
router.post(
  "/admin/collections",
  authenticate,
  authorize(MODULE, PermissionEnum.CREATE),
  validateRequest({ schema: createCollectionSchema }),
  CollectionController.createCollection,
);
router.get(
  "/admin/collections/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  CollectionController.getCollection,
);
router.patch(
  "/admin/collections/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: updateCollectionSchema }),
  CollectionController.updateCollection,
);
router.delete(
  "/admin/collections/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.DELETE),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  CollectionController.deleteCollection,
);

export default router;
