import { Router } from "express";
import { editEntryController } from "../controllers/editEntry.controller.js";
import { validate } from "../middlewares/validate.js";
import { idParams } from "../validators/common.validator.js";
import {
  createEditEntryBody,
  reorderEditBody,
  updateEditEntryBody,
} from "../validators/editEntry.validator.js";

/** /edit — The Edit on What's New, in order. */
export const editEntryPublicRoutes = Router().get("/", editEntryController.listPublished);

/** /admin/edit */
export const editEntryAdminRoutes = Router()
  .get("/", editEntryController.list)
  .post("/", validate({ body: createEditEntryBody }), editEntryController.create)
  .put("/order", validate({ body: reorderEditBody }), editEntryController.reorder)
  .get("/:id", validate({ params: idParams }), editEntryController.get)
  .patch(
    "/:id",
    validate({ params: idParams, body: updateEditEntryBody }),
    editEntryController.update,
  )
  .delete("/:id", validate({ params: idParams }), editEntryController.remove);
