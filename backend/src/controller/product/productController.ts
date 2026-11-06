import type { RequestHandler } from "express";
import ProductUseCase from "../../usecase/product/productUseCase.js";
import { bodyOf, paramOf, queryOf } from "../../util/helper/request.js";
import { sendCreated, sendNoContent, sendPage, sendSuccess } from "../../util/helper/response.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../../validator/productSchema.js";

class ProductController {
  /** Public: active pieces only. */
  listActiveProducts: RequestHandler = async (req, res, next) => {
    try {
      const query = queryOf<ListProductsQuery>(req);
      sendPage(res, await ProductUseCase.listProducts(query, { onlyActive: true }));
    } catch (error) {
      next(error);
    }
  };

  /** Public product page: GET /products/:key, where key is the product id (or a legacy slug). */
  getActiveProduct: RequestHandler = async (req, res, next) => {
    try {
      const product = await ProductUseCase.getActiveProductByKey(paramOf(req, "key"));
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  };

  listProducts: RequestHandler = async (req, res, next) => {
    try {
      const query = queryOf<ListProductsQuery>(req);
      sendPage(res, await ProductUseCase.listProducts(query, { onlyActive: false }));
    } catch (error) {
      next(error);
    }
  };

  getProduct: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await ProductUseCase.getProduct(paramOf(req, "id")));
    } catch (error) {
      next(error);
    }
  };

  createProduct: RequestHandler = async (req, res, next) => {
    try {
      sendCreated(res, await ProductUseCase.createProduct(bodyOf<CreateProductInput>(req)));
    } catch (error) {
      next(error);
    }
  };

  updateProduct: RequestHandler = async (req, res, next) => {
    try {
      const product = await ProductUseCase.updateProduct(
        paramOf(req, "id"),
        bodyOf<UpdateProductInput>(req),
      );
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct: RequestHandler = async (req, res, next) => {
    try {
      await ProductUseCase.deleteProduct(paramOf(req, "id"));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export default new ProductController();
