import type { RequestHandler } from "express";
import CategoryUseCase from "../../usecase/category/categoryUseCase.js";
import { sendSuccess } from "../../util/helper/response.js";

class CategoryController {
  /** Public / CMS picker: active categories as { name, slug }. */
  listOptions: RequestHandler = async (_req, res, next) => {
    try {
      sendSuccess(res, await CategoryUseCase.listActiveOptions());
    } catch (error) {
      next(error);
    }
  };
}

export default new CategoryController();
