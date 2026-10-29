import { Router } from "express";
import { craftController } from "../controllers/craft.controller.js";
import { validate } from "../middlewares/validate.js";
import { idParams, slugParams } from "../validators/common.validator.js";
import {
  createCraftBody,
  listCraftsQuery,
  updateCraftBody,
} from "../validators/craft.validator.js";

/** /crafts — published craft stories only. */
export const craftPublicRoutes = Router()
  .get("/", validate({ query: listCraftsQuery }), craftController.listPublished)
  .get("/:slug", validate({ params: slugParams }), craftController.getPublishedBySlug);

/** /admin/crafts */
export const craftAdminRoutes = Router()
  .get("/", validate({ query: listCraftsQuery }), craftController.list)
  .post("/", validate({ body: createCraftBody }), craftController.create)
  .get("/:id", validate({ params: idParams }), craftController.get)
  .patch("/:id", validate({ params: idParams, body: updateCraftBody }), craftController.update)
  .delete("/:id", validate({ params: idParams }), craftController.remove);
