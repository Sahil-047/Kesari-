import type { RequestHandler } from "express";
import { collectionService } from "../services/collection.service.js";
import { param, validatedBody, validatedQuery } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type {
  CreateCollectionInput,
  ListCollectionsQuery,
  UpdateCollectionInput,
} from "../validators/collection.validator.js";

export const collectionController = {
  listPublished: (async (req, res) => {
    const query = validatedQuery<ListCollectionsQuery>(req);
    const { items, meta } = await collectionService.list(query, { onlyPublished: true });
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  getPublishedBySlug: (async (req, res) => {
    sendSuccess(
      res,
      await collectionService.getBySlug(param(req, "slug"), { onlyPublished: true }),
    );
  }) satisfies RequestHandler,

  list: (async (req, res) => {
    const query = validatedQuery<ListCollectionsQuery>(req);
    const { items, meta } = await collectionService.list(query, { onlyPublished: false });
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await collectionService.get(param(req, "id")));
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const collection = await collectionService.create(validatedBody<CreateCollectionInput>(req));
    sendSuccess(res, collection, { status: 201 });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const collection = await collectionService.update(
      param(req, "id"),
      validatedBody<UpdateCollectionInput>(req),
    );
    sendSuccess(res, collection);
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await collectionService.remove(param(req, "id"));
    sendNoContent(res);
  }) satisfies RequestHandler,
};
