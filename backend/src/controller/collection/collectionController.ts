import type { RequestHandler } from "express";
import CollectionUseCase from "../../usecase/collection/collectionUseCase.js";
import { bodyOf, paramOf, queryOf } from "../../util/helper/request.js";
import { sendCreated, sendNoContent, sendPage, sendSuccess } from "../../util/helper/response.js";
import type {
  CreateCollectionInput,
  ListCollectionsQuery,
  UpdateCollectionInput,
} from "../../validator/collectionSchema.js";

class CollectionController {
  /** Public: published colour collections only. */
  listPublishedCollections: RequestHandler = async (req, res, next) => {
    try {
      const query = queryOf<ListCollectionsQuery>(req);
      sendPage(res, await CollectionUseCase.listCollections(query, { onlyPublished: true }));
    } catch (error) {
      next(error);
    }
  };

  getPublishedCollectionBySlug: RequestHandler = async (req, res, next) => {
    try {
      const collection = await CollectionUseCase.getCollectionBySlug(paramOf(req, "slug"), {
        onlyPublished: true,
      });
      sendSuccess(res, collection);
    } catch (error) {
      next(error);
    }
  };

  listCollections: RequestHandler = async (req, res, next) => {
    try {
      const query = queryOf<ListCollectionsQuery>(req);
      sendPage(res, await CollectionUseCase.listCollections(query, { onlyPublished: false }));
    } catch (error) {
      next(error);
    }
  };

  getCollection: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await CollectionUseCase.getCollection(paramOf(req, "id")));
    } catch (error) {
      next(error);
    }
  };

  createCollection: RequestHandler = async (req, res, next) => {
    try {
      sendCreated(res, await CollectionUseCase.createCollection(bodyOf<CreateCollectionInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  updateCollection: RequestHandler = async (req, res, next) => {
    try {
      const collection = await CollectionUseCase.updateCollection(
        paramOf(req, "id"),
        bodyOf<UpdateCollectionInput>(req),
      );
      sendSuccess(res, collection);
    } catch (error) {
      next(error);
    }
  };

  deleteCollection: RequestHandler = async (req, res, next) => {
    try {
      await CollectionUseCase.deleteCollection(paramOf(req, "id"));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export default new CollectionController();
