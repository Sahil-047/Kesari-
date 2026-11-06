import type { RequestHandler } from "express";
import CraftUseCase from "../../usecase/craft/craftUseCase.js";
import { bodyOf, paramOf, queryOf } from "../../util/helper/request.js";
import { sendCreated, sendNoContent, sendPage, sendSuccess } from "../../util/helper/response.js";
import type {
  CreateCraftInput,
  ListCraftsQuery,
  UpdateCraftInput,
} from "../../validator/craftSchema.js";

class CraftController {
  /** Public: published craft stories only. */
  listPublishedCrafts: RequestHandler = async (req, res, next) => {
    try {
      const query = queryOf<ListCraftsQuery>(req);
      sendPage(res, await CraftUseCase.listCrafts(query, { onlyPublished: true }));
    } catch (error) {
      next(error);
    }
  };

  getPublishedCraftBySlug: RequestHandler = async (req, res, next) => {
    try {
      const craft = await CraftUseCase.getCraftBySlug(paramOf(req, "slug"), { onlyPublished: true });
      sendSuccess(res, craft);
    } catch (error) {
      next(error);
    }
  };

  listCrafts: RequestHandler = async (req, res, next) => {
    try {
      const query = queryOf<ListCraftsQuery>(req);
      sendPage(res, await CraftUseCase.listCrafts(query, { onlyPublished: false }));
    } catch (error) {
      next(error);
    }
  };

  getCraft: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await CraftUseCase.getCraft(paramOf(req, "id")));
    } catch (error) {
      next(error);
    }
  };

  createCraft: RequestHandler = async (req, res, next) => {
    try {
      sendCreated(res, await CraftUseCase.createCraft(bodyOf<CreateCraftInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  updateCraft: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await CraftUseCase.updateCraft(paramOf(req, "id"), bodyOf<UpdateCraftInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  deleteCraft: RequestHandler = async (req, res, next) => {
    try {
      await CraftUseCase.deleteCraft(paramOf(req, "id"));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export default new CraftController();
