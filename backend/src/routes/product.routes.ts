import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.js";
import { idParams, slugParams } from "../validators/common.validator.js";
import {
  createProductBody,
  listProductsQuery,
  updateProductBody,
} from "../validators/product.validator.js";

/** /products — published pieces only. */
export const productPublicRoutes = Router()
  .get("/", validate({ query: listProductsQuery }), productController.listPublished)
  .get("/:slug", validate({ params: slugParams }), productController.getPublishedBySlug);

/** /admin/products — every piece, drafts included. */
export const productAdminRoutes = Router()
  .get("/", validate({ query: listProductsQuery }), productController.list)
  .post("/", validate({ body: createProductBody }), productController.create)
  .get("/:id", validate({ params: idParams }), productController.get)
  .patch("/:id", validate({ params: idParams, body: updateProductBody }), productController.update)
  .delete("/:id", validate({ params: idParams }), productController.remove);
