import { Router } from "express";
import { mediaController } from "../controllers/media.controller.js";
import { uploadSingle } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import { idParams } from "../validators/common.validator.js";
import {
  listMediaQuery,
  updateMediaBody,
  uploadMediaBody,
} from "../validators/media.validator.js";

/** /admin/media — the S3-backed media library. */
export const mediaAdminRoutes = Router()
  .get("/", validate({ query: listMediaQuery }), mediaController.list)
  .post("/", uploadSingle, validate({ body: uploadMediaBody }), mediaController.upload)
  .get("/:id", validate({ params: idParams }), mediaController.get)
  .patch("/:id", validate({ params: idParams, body: updateMediaBody }), mediaController.update)
  .delete("/:id", validate({ params: idParams }), mediaController.remove);
