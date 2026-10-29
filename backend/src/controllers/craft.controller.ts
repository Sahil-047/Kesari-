import type { RequestHandler } from "express";
import { craftService } from "../services/craft.service.js";
import { param, validatedBody, validatedQuery } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type {
  CreateCraftInput,
  ListCraftsQuery,
  UpdateCraftInput,
} from "../validators/craft.validator.js";

export const craftController = {
  listPublished: (async (req, res) => {
    const query = validatedQuery<ListCraftsQuery>(req);
    const { items, meta } = await craftService.list(query, { onlyPublished: true });
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  getPublishedBySlug: (async (req, res) => {
    sendSuccess(res, await craftService.getBySlug(param(req, "slug"), { onlyPublished: true }));
  }) satisfies RequestHandler,

  list: (async (req, res) => {
    const query = validatedQuery<ListCraftsQuery>(req);
    const { items, meta } = await craftService.list(query, { onlyPublished: false });
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await craftService.get(param(req, "id")));
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const craft = await craftService.create(validatedBody<CreateCraftInput>(req));
    sendSuccess(res, craft, { status: 201 });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const craft = await craftService.update(param(req, "id"), validatedBody<UpdateCraftInput>(req));
    sendSuccess(res, craft);
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await craftService.remove(param(req, "id"));
    sendNoContent(res);
  }) satisfies RequestHandler,
};
