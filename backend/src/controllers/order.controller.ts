import type { RequestHandler } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { orderService } from "../services/order.service.js";
import { currentUser, param, validatedBody, validatedQuery } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type {
  CreateOrderInput,
  CreateOrderRequestInput,
  ListOrdersQuery,
  SalesQuery,
  UpdateOrderInput,
} from "../validators/order.validator.js";

export const orderController = {
  /** Public: order request from the bag. Returns only the order number and total. */
  request: (async (req, res) => {
    const order = await orderService.createRequest(validatedBody<CreateOrderRequestInput>(req));
    sendSuccess(res, order, { status: 201 });
  }) satisfies RequestHandler,

  list: (async (req, res) => {
    const { items, meta } = await orderService.list(validatedQuery<ListOrdersQuery>(req));
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await orderService.get(param(req, "id")));
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const order = await orderService.create(validatedBody<CreateOrderInput>(req), currentUser(req).id);
    sendSuccess(res, order, { status: 201 });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    sendSuccess(res, await orderService.update(param(req, "id"), validatedBody<UpdateOrderInput>(req)));
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await orderService.remove(param(req, "id"));
    sendNoContent(res);
  }) satisfies RequestHandler,

  sales: (async (req, res) => {
    sendSuccess(res, await analyticsService.sales(validatedQuery<SalesQuery>(req)));
  }) satisfies RequestHandler,
};
