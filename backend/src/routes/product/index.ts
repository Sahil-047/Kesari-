import { Router } from "express";
import ProductController from "../../controller/product/productController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import { idParams } from "../../validator/commonSchema.js";
import {
  createProductSchema,
  listProductsSchema,
  productKeyParams,
  updateProductSchema,
} from "../../validator/productSchema.js";

const MODULE = ModulesEnum.PRODUCT;

/** Mounted at /api: public /products and CMS /admin/products. */
const router = Router();

router.get(
  "/products",
  validateRequest({ schema: listProductsSchema, type: PayloadType.QUERY }),
  ProductController.listActiveProducts,
);
// Product pages link by id (/product/<id>); a slug still works for older links.
router.get(
  "/products/:key",
  validateRequest({ schema: productKeyParams, type: PayloadType.PARAMS }),
  ProductController.getActiveProduct,
);

router.get(
  "/admin/products",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: listProductsSchema, type: PayloadType.QUERY }),
  ProductController.listProducts,
);
router.post(
  "/admin/products",
  authenticate,
  authorize(MODULE, PermissionEnum.CREATE),
  validateRequest({ schema: createProductSchema }),
  ProductController.createProduct,
);
router.get(
  "/admin/products/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  ProductController.getProduct,
);
router.patch(
  "/admin/products/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: updateProductSchema }),
  ProductController.updateProduct,
);
router.delete(
  "/admin/products/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.DELETE),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  ProductController.deleteProduct,
);

export default router;
