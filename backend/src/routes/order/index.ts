import { Router } from "express";
import OrderController from "../../controller/order/orderController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PayloadType } from "../../util/enum/common.enum.js";
import { ModulesEnum } from "../../util/enum/modules.enum.js";
import { PermissionEnum } from "../../util/enum/permission.enum.js";
import { idParams } from "../../validator/commonSchema.js";
import {
  createOrderRequestSchema,
  createOrderSchema,
  listOrdersSchema,
  salesSchema,
  updateOrderSchema,
} from "../../validator/orderSchema.js";

const MODULE = ModulesEnum.ORDER;

/** Mounted at /api: public /orders (bag), CMS /admin/orders and /admin/analytics. */
const router = Router();

router.post(
  "/orders",
  validateRequest({ schema: createOrderRequestSchema }),
  OrderController.requestOrder,
);

router.get(
  "/admin/orders",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: listOrdersSchema, type: PayloadType.QUERY }),
  OrderController.listOrders,
);
router.post(
  "/admin/orders",
  authenticate,
  authorize(MODULE, PermissionEnum.CREATE),
  validateRequest({ schema: createOrderSchema }),
  OrderController.recordSale,
);
router.get(
  "/admin/orders/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.VIEW),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  OrderController.getOrder,
);
router.patch(
  "/admin/orders/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.EDIT),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  validateRequest({ schema: updateOrderSchema }),
  OrderController.updateOrder,
);
router.delete(
  "/admin/orders/:id",
  authenticate,
  authorize(MODULE, PermissionEnum.DELETE),
  validateRequest({ schema: idParams, type: PayloadType.PARAMS }),
  OrderController.deleteOrder,
);

router.get(
  "/admin/analytics/sales",
  authenticate,
  authorize(ModulesEnum.ANALYTICS, PermissionEnum.VIEW),
  validateRequest({ schema: salesSchema, type: PayloadType.QUERY }),
  OrderController.salesReport,
);

export default router;
