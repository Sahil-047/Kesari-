import { ProductModel } from "../models/index.js";
import type { Product } from "../schemas/product.schema.js";
import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(ProductModel);
  }

  findBySlug(slug: string, onlyPublished: boolean) {
    return ProductModel.findOne({ slug, ...(onlyPublished && { status: "published" }) }).exec();
  }
}

export const productRepository = new ProductRepository();
