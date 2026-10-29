import type { FilterQuery } from "mongoose";
import { editEntryRepository } from "../repositories/editEntry.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import type { Product } from "../schemas/product.schema.js";
import { ApiError } from "../utils/ApiError.js";
import { searchFilter } from "../utils/regex.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../validators/product.validator.js";
import { resolveSlug } from "./slug.service.js";

function buildFilter(query: ListProductsQuery, onlyPublished: boolean): FilterQuery<Product> {
  return {
    ...(onlyPublished ? { status: "published" } : query.status && { status: query.status }),
    ...(query.category && { category: query.category }),
    ...(query.craft && { craft: query.craft }),
    ...(query.featured !== undefined && { featured: query.featured }),
    ...(query.search && searchFilter(["name", "craft", "category"], query.search)),
  };
}

async function getOrThrow(id: string) {
  const product = await productRepository.findById(id);
  if (!product) throw ApiError.notFound("Product");
  return product;
}

export const productService = {
  list(query: ListProductsQuery, { onlyPublished }: { onlyPublished: boolean }) {
    return productRepository.list({
      filter: buildFilter(query, onlyPublished),
      page: query.page,
      limit: query.limit,
    });
  },

  async getBySlug(slug: string, { onlyPublished }: { onlyPublished: boolean }) {
    const product = await productRepository.findBySlug(slug, onlyPublished);
    if (!product) throw ApiError.notFound("Product");
    return product;
  },

  get: getOrThrow,

  async create(input: CreateProductInput) {
    const slug = await resolveSlug(productRepository, { explicit: input.slug, source: input.name });
    return productRepository.create({ ...input, slug });
  },

  async update(id: string, input: UpdateProductInput) {
    const product = await getOrThrow(id);
    const slug =
      input.slug && input.slug !== product.slug
        ? await resolveSlug(productRepository, { explicit: input.slug, source: product.name, excludeId: id })
        : undefined;
    return productRepository.updateById(id, { ...input, ...(slug && { slug }) });
  },

  async remove(id: string) {
    await getOrThrow(id);
    if (await editEntryRepository.exists({ product: id })) {
      throw ApiError.conflict("This product is in The Edit. Remove it from The Edit first.");
    }
    await productRepository.deleteById(id);
  },
};
