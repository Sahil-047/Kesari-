import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { validate } from "../middlewares/validate.js";
import { idParams } from "../validators/common.validator.js";
import {
  createOrderBody,
  createOrderRequestBody,
  listOrdersQuery,
  salesQuery,
  updateOrderBody,
} from "../validators/order.validator.js";

/** /orders — order requests from the website bag. */
export const orderPublicRoutes = Router().post(
  "/",
  validate({ body: createOrderRequestBody }),
  orderController.request,
);

/** /admin/orders */
export const orderAdminRoutes = Router()
  .get("/", validate({ query: listOrdersQuery }), orderController.list)
  .post("/", validate({ body: createOrderBody }), orderController.create)
  .get("/:id", validate({ params: idParams }), orderController.get)
  .patch("/:id", validate({ params: idParams, body: updateOrderBody }), orderController.update)
  .delete("/:id", validate({ params: idParams }), orderController.remove);

/** /admin/analytics */
export const analyticsAdminRoutes = Router().get(
  "/sales",
  validate({ query: salesQuery }),
  orderController.sales,
);
