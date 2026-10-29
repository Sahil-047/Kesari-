import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { authRoutes } from "./auth.routes.js";
import { collectionAdminRoutes, collectionPublicRoutes } from "./collection.routes.js";
import { craftAdminRoutes, craftPublicRoutes } from "./craft.routes.js";
import { editEntryAdminRoutes, editEntryPublicRoutes } from "./editEntry.routes.js";
import { enquiryAdminRoutes, enquiryPublicRoutes } from "./enquiry.routes.js";
import { mediaAdminRoutes } from "./media.routes.js";
import { productAdminRoutes, productPublicRoutes } from "./product.routes.js";
import { userAdminRoutes } from "./user.routes.js";

/** CMS: every route here needs a signed-in admin or editor. */
const adminRoutes = Router()
  .use(authenticate, authorize("admin", "editor"))
  .use("/products", productAdminRoutes)
  .use("/crafts", craftAdminRoutes)
  .use("/collections", collectionAdminRoutes)
  .use("/edit", editEntryAdminRoutes)
  .use("/enquiries", enquiryAdminRoutes)
  .use("/media", mediaAdminRoutes)
  .use("/users", authorize("admin"), userAdminRoutes);

/** Mounted at /api/v1. */
export const apiRoutes = Router()
  .use("/auth", authRoutes)
  .use("/products", productPublicRoutes)
  .use("/crafts", craftPublicRoutes)
  .use("/collections", collectionPublicRoutes)
  .use("/edit", editEntryPublicRoutes)
  .use("/enquiries", enquiryPublicRoutes)
  .use("/admin", adminRoutes);
