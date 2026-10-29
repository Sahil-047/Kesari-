import type { RequestHandler } from "express";
import { editEntryService } from "../services/editEntry.service.js";
import { param, validatedBody } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type {
  CreateEditEntryInput,
  ReorderEditInput,
  UpdateEditEntryInput,
} from "../validators/editEntry.validator.js";

export const editEntryController = {
  listPublished: (async (_req, res) => {
    sendSuccess(res, await editEntryService.listPublic());
  }) satisfies RequestHandler,

  list: (async (_req, res) => {
    sendSuccess(res, await editEntryService.listAll());
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await editEntryService.get(param(req, "id")));
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const entry = await editEntryService.create(validatedBody<CreateEditEntryInput>(req));
    sendSuccess(res, entry, { status: 201 });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const entry = await editEntryService.update(
      param(req, "id"),
      validatedBody<UpdateEditEntryInput>(req),
    );
    sendSuccess(res, entry);
  }) satisfies RequestHandler,

  reorder: (async (req, res) => {
    sendSuccess(res, await editEntryService.reorder(validatedBody<ReorderEditInput>(req)));
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await editEntryService.remove(param(req, "id"));
    sendNoContent(res);
  }) satisfies RequestHandler,
};
