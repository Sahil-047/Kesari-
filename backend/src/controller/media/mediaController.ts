import { NoSuchKey } from "@aws-sdk/client-s3";
import { HttpStatusCode } from "axios";
import type { RequestHandler } from "express";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import MediaUseCase from "../../usecase/media/mediaUseCase.js";
import { bodyOf, currentUser, paramOf, queryOf } from "../../util/helper/request.js";
import { sendCreated, sendNoContent, sendPage, sendSuccess } from "../../util/helper/response.js";
import { objectKeyFromParams } from "../../util/helper/s3.js";
import type {
  ListMediaQuery,
  UpdateMediaInput,
  UploadMediaInput,
} from "../../validator/mediaSchema.js";

class MediaController {
  uploadMedia: RequestHandler = async (req, res, next) => {
    try {
      const media = await MediaUseCase.uploadMedia(
        req.file,
        bodyOf<UploadMediaInput>(req),
        currentUser(req).id,
      );
      sendCreated(res, media);
    } catch (error) {
      next(error);
    }
  };

  listMedia: RequestHandler = async (req, res, next) => {
    try {
      sendPage(res, await MediaUseCase.listMedia(queryOf<ListMediaQuery>(req)));
    } catch (error) {
      next(error);
    }
  };

  getMedia: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await MediaUseCase.getMedia(paramOf(req, "id")));
    } catch (error) {
      next(error);
    }
  };

  updateMedia: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await MediaUseCase.updateMedia(paramOf(req, "id"), bodyOf<UpdateMediaInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  deleteMedia: RequestHandler = async (req, res, next) => {
    try {
      await MediaUseCase.deleteMedia(paramOf(req, "id"));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };

  /** GET /img/<key>: streams a private S3 object to the browser. Supports Range for video. */
  serveObject: RequestHandler = async (req, res, next) => {
    try {
      const key = objectKeyFromParams(req.params.key);
      if (!key) {
        res.status(HttpStatusCode.BadRequest).type("text").send("Bad key");
        return;
      }

      const range = typeof req.headers.range === "string" ? req.headers.range : undefined;
      const obj = await MediaUseCase.readObject(key, range);
      if (!obj.Body) {
        res.status(HttpStatusCode.NotFound).type("text").send("Not found");
        return;
      }

      // The storefront loads these from a different origin (e.g. :3000 → :4000).
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Type", obj.ContentType ?? "application/octet-stream");
      res.setHeader("Cache-Control", obj.CacheControl ?? "public, max-age=31536000, immutable");
      if (obj.ETag) res.setHeader("ETag", obj.ETag);
      if (obj.ContentLength != null) res.setHeader("Content-Length", String(obj.ContentLength));
      if (obj.ContentRange) res.setHeader("Content-Range", obj.ContentRange);

      res.status(range && obj.ContentRange ? HttpStatusCode.PartialContent : HttpStatusCode.Ok);
      await pipeline(obj.Body as Readable, res);
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (error instanceof NoSuchKey || status === HttpStatusCode.NotFound) {
        res.status(HttpStatusCode.NotFound).type("text").send("Not found");
        return;
      }
      // S3 returns 416 when the Range is unsatisfiable.
      if (status === HttpStatusCode.RangeNotSatisfiable) {
        res.status(HttpStatusCode.RangeNotSatisfiable).type("text").send("Range Not Satisfiable");
        return;
      }
      next(error);
    }
  };
}

export default new MediaController();
