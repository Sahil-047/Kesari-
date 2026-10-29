import { Router } from "express";
import { enquiryController } from "../controllers/enquiry.controller.js";
import { validate } from "../middlewares/validate.js";
import { idParams } from "../validators/common.validator.js";
import {
  createEnquiryBody,
  listEnquiriesQuery,
  updateEnquiryBody,
} from "../validators/enquiry.validator.js";

/** /enquiries — the public Atelier form posts here. */
export const enquiryPublicRoutes = Router().post(
  "/",
  validate({ body: createEnquiryBody }),
  enquiryController.submit,
);

/** /admin/enquiries */
export const enquiryAdminRoutes = Router()
  .get("/", validate({ query: listEnquiriesQuery }), enquiryController.list)
  .get("/:id", validate({ params: idParams }), enquiryController.get)
  .patch("/:id", validate({ params: idParams, body: updateEnquiryBody }), enquiryController.update)
  .delete("/:id", validate({ params: idParams }), enquiryController.remove);
