import type { RequestHandler } from "express";
import AnalyticsUseCase from "../../usecase/analytics/analyticsUseCase.js";
import OrderUseCase from "../../usecase/order/orderUseCase.js";
import { bodyOf, currentUser, paramOf, queryOf } from "../../util/helper/request.js";
import { sendCreated, sendNoContent, sendPage, sendSuccess } from "../../util/helper/response.js";
import type {
  CreateOrderInput,
  CreateOrderRequestInput,
  ListOrdersQuery,
  SalesQuery,
  UpdateOrderInput,
} from "../../validator/orderSchema.js";

class OrderController {
  /** Public: order request from the bag. Returns only the order number and total. */
  requestOrder: RequestHandler = async (req, res, next) => {
    try {
      sendCreated(res, await OrderUseCase.requestOrder(bodyOf<CreateOrderRequestInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  listOrders: RequestHandler = async (req, res, next) => {
    try {
      sendPage(res, await OrderUseCase.listOrders(queryOf<ListOrdersQuery>(req)));
    } catch (error) {
      next(error);
    }
  };

  getOrder: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await OrderUseCase.getOrder(paramOf(req, "id")));
    } catch (error) {
      next(error);
    }
  };

  recordSale: RequestHandler = async (req, res, next) => {
    try {
      const order = await OrderUseCase.recordSale(bodyOf<CreateOrderInput>(req), currentUser(req).id);
      sendCreated(res, order);
    } catch (error) {
      next(error);
    }
  };

  updateOrder: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await OrderUseCase.updateOrder(paramOf(req, "id"), bodyOf<UpdateOrderInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  deleteOrder: RequestHandler = async (req, res, next) => {
    try {
      await OrderUseCase.deleteOrder(paramOf(req, "id"));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };

  salesReport: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await AnalyticsUseCase.salesReport(queryOf<SalesQuery>(req)));
    } catch (error) {
      next(error);
    }
  };
}

export default new OrderController();
