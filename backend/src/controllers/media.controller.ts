import type { RequestHandler } from "express";
import { mediaService } from "../services/media.service.js";
import { currentUser, param, validatedBody, validatedQuery } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type {
  ListMediaQuery,
  UpdateMediaInput,
  UploadMediaInput,
} from "../validators/media.validator.js";

export const mediaController = {
  upload: (async (req, res) => {
    const media = await mediaService.upload(
      req.file,
      validatedBody<UploadMediaInput>(req),
      currentUser(req).id,
    );
    sendSuccess(res, media, { status: 201 });
  }) satisfies RequestHandler,

  list: (async (req, res) => {
    const { items, meta } = await mediaService.list(validatedQuery<ListMediaQuery>(req));
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await mediaService.get(param(req, "id")));
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const media = await mediaService.update(param(req, "id"), validatedBody<UpdateMediaInput>(req));
    sendSuccess(res, media);
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await mediaService.remove(param(req, "id"));
    sendNoContent(res);
  }) satisfies RequestHandler,
};
