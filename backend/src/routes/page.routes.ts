import { Router } from "express";
import { pageController } from "../controllers/page.controller.js";
import { validate } from "../middlewares/validate.js";
import { pageSlugParams, saveDraftBody } from "../validators/page.validator.js";

/** /pages/:slug — the published content of a page. */
export const pagePublicRoutes = Router().get(
  "/:slug",
  validate({ params: pageSlugParams }),
  pageController.getPublished,
);

/** /admin/pages — edit a page as a draft, then publish it. */
export const pageAdminRoutes = Router()
  .get("/", pageController.list)
  .get("/:slug", validate({ params: pageSlugParams }), pageController.get)
  .put(
    "/:slug",
    validate({ params: pageSlugParams, body: saveDraftBody }),
    pageController.saveDraft,
  )
  .post("/:slug/publish", validate({ params: pageSlugParams }), pageController.publish);
