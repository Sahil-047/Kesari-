import type { RequestHandler } from "express";
import { productService } from "../services/product.service.js";
import { param, validatedBody, validatedQuery } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../validators/product.validator.js";

export const productController = {
  listPublished: (async (req, res) => {
    const query = validatedQuery<ListProductsQuery>(req);
    const { items, meta } = await productService.list(query, { onlyPublished: true });
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  getPublishedBySlug: (async (req, res) => {
    sendSuccess(res, await productService.getBySlug(param(req, "slug"), { onlyPublished: true }));
  }) satisfies RequestHandler,

  list: (async (req, res) => {
    const query = validatedQuery<ListProductsQuery>(req);
    const { items, meta } = await productService.list(query, { onlyPublished: false });
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await productService.get(param(req, "id")));
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const product = await productService.create(validatedBody<CreateProductInput>(req));
    sendSuccess(res, product, { status: 201 });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const product = await productService.update(
      param(req, "id"),
      validatedBody<UpdateProductInput>(req),
    );
    sendSuccess(res, product);
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await productService.remove(param(req, "id"));
    sendNoContent(res);
  }) satisfies RequestHandler,
};
