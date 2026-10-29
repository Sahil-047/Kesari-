import { Router } from "express";
import { collectionController } from "../controllers/collection.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createCollectionBody,
  listCollectionsQuery,
  updateCollectionBody,
} from "../validators/collection.validator.js";
import { idParams, slugParams } from "../validators/common.validator.js";

/** /collections — published colour collections only. */
export const collectionPublicRoutes = Router()
  .get("/", validate({ query: listCollectionsQuery }), collectionController.listPublished)
  .get("/:slug", validate({ params: slugParams }), collectionController.getPublishedBySlug);

/** /admin/collections */
export const collectionAdminRoutes = Router()
  .get("/", validate({ query: listCollectionsQuery }), collectionController.list)
  .post("/", validate({ body: createCollectionBody }), collectionController.create)
  .get("/:id", validate({ params: idParams }), collectionController.get)
  .patch(
    "/:id",
    validate({ params: idParams, body: updateCollectionBody }),
    collectionController.update,
  )
  .delete("/:id", validate({ params: idParams }), collectionController.remove);
