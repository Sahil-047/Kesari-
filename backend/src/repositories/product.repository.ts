import { trusted } from "mongoose";
import { ProductModel } from "../models/index.js";
import type { Product } from "../schemas/product.schema.js";
import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(ProductModel);
  }

  findPublishedBySlugs(slugs: string[]) {
    // trusted(): our own operator, exempt from the global sanitizeFilter.
    return ProductModel.find({ slug: trusted({ $in: slugs }), status: "published" }).exec();
  }

  findBySlug(slug: string, onlyPublished: boolean) {
    return ProductModel.findOne({ slug, ...(onlyPublished && { status: "published" }) }).exec();
  }
}

export const productRepository = new ProductRepository();
