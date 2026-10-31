import type { RequestHandler } from "express";
import type { PageSlug } from "../schemas/page.schema.js";
import { pageService } from "../services/page.service.js";
import { currentUser, param, validatedBody } from "../utils/request.js";
import { sendSuccess } from "../utils/response.js";
import type { SaveDraftInput } from "../validators/page.validator.js";

const slugOf = (req: Parameters<RequestHandler>[0]) => param(req, "slug") as PageSlug;

export const pageController = {
  getPublished: (async (req, res) => {
    sendSuccess(res, await pageService.getPublished(slugOf(req)));
  }) satisfies RequestHandler,

  list: (async (_req, res) => {
    sendSuccess(res, await pageService.list());
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await pageService.get(slugOf(req)));
  }) satisfies RequestHandler,

  saveDraft: (async (req, res) => {
    const { content } = validatedBody<SaveDraftInput>(req);
    sendSuccess(res, await pageService.saveDraft(slugOf(req), content, currentUser(req).id));
  }) satisfies RequestHandler,

  publish: (async (req, res) => {
    sendSuccess(res, await pageService.publish(slugOf(req), currentUser(req).id));
  }) satisfies RequestHandler,
};
