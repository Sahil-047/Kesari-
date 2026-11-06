import type { Request, RequestHandler } from "express";
import PageUseCase from "../../usecase/page/pageUseCase.js";
import type { PageSlugEnum } from "../../util/enum/page.enum.js";
import { bodyOf, currentUser, paramOf } from "../../util/helper/request.js";
import { sendSuccess } from "../../util/helper/response.js";
import type { SaveDraftInput } from "../../validator/pageSchema.js";

const slugOf = (req: Request) => paramOf(req, "slug") as PageSlugEnum;

class PageController {
  /** Public: the published content of a page. */
  getPublishedPage: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await PageUseCase.getPublishedPage(slugOf(req)));
    } catch (error) {
      next(error);
    }
  };

  listPages: RequestHandler = async (_req, res, next) => {
    try {
      sendSuccess(res, await PageUseCase.listPages());
    } catch (error) {
      next(error);
    }
  };

  getPage: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await PageUseCase.getPageForEditor(slugOf(req)));
    } catch (error) {
      next(error);
    }
  };

  saveDraft: RequestHandler = async (req, res, next) => {
    try {
      const { content } = bodyOf<SaveDraftInput>(req);
      sendSuccess(res, await PageUseCase.saveDraft(slugOf(req), content, currentUser(req).id));
    } catch (error) {
      next(error);
    }
  };

  publishPage: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await PageUseCase.publishPage(slugOf(req), currentUser(req).id));
    } catch (error) {
      next(error);
    }
  };
}

export default new PageController();
