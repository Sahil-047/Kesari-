import { Router } from "express";
import CategoryController from "../../controller/category/categoryController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";

const MODULE = ModulesEnum.PRODUCT;

/** Master categories are upserted only when a product is created/updated. */
const router = Router();

router.get("/categories", CategoryController.listOptions);

router.get(
  "/admin/categories/options",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  CategoryController.listOptions,
);

export default router;
