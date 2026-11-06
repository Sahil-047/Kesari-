import type { RequestHandler } from "express";
import EditEntryUseCase from "../../usecase/editEntry/editEntryUseCase.js";
import { bodyOf, paramOf } from "../../util/helper/request.js";
import { sendCreated, sendNoContent, sendSuccess } from "../../util/helper/response.js";
import type {
  CreateEditEntryInput,
  ReorderEditInput,
  UpdateEditEntryInput,
} from "../../validator/editEntrySchema.js";

class EditEntryController {
  /** Public: The Edit in order. */
  listPublicEdit: RequestHandler = async (_req, res, next) => {
    try {
      sendSuccess(res, await EditEntryUseCase.listPublicEdit());
    } catch (error) {
      next(error);
    }
  };

  listEdit: RequestHandler = async (_req, res, next) => {
    try {
      sendSuccess(res, await EditEntryUseCase.listEdit());
    } catch (error) {
      next(error);
    }
  };

  getEntry: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await EditEntryUseCase.getEntry(paramOf(req, "id")));
    } catch (error) {
      next(error);
    }
  };

  createEntry: RequestHandler = async (req, res, next) => {
    try {
      sendCreated(res, await EditEntryUseCase.createEntry(bodyOf<CreateEditEntryInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  updateEntry: RequestHandler = async (req, res, next) => {
    try {
      const entry = await EditEntryUseCase.updateEntry(
        paramOf(req, "id"),
        bodyOf<UpdateEditEntryInput>(req),
      );
      sendSuccess(res, entry);
    } catch (error) {
      next(error);
    }
  };

  reorderEdit: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await EditEntryUseCase.reorderEdit(bodyOf<ReorderEditInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  deleteEntry: RequestHandler = async (req, res, next) => {
    try {
      await EditEntryUseCase.deleteEntry(paramOf(req, "id"));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export default new EditEntryController();
