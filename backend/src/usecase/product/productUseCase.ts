import type { FilterQuery } from "mongoose";
import EditEntryModel from "../../model/editEntry.model.js";
import ProductModel from "../../model/product.model.js";
import { ProductPlacementEnum } from "../../util/enum/placement.enum.js";
import { ACTIVE_PRODUCT_STATUSES } from "../../util/enum/product.enum.js";
import CustomError from "../../util/helper/customError.js";
import { paginate } from "../../util/helper/paginate.js";
import { inList, searchFilter } from "../../util/helper/regex.js";
import { resolveSlug } from "../../util/helper/slug.js";
import type { IProduct } from "../../util/interface/catalogue.interface.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../../validator/productSchema.js";

type Visibility = { onlyActive: boolean };

/** A Mongo ObjectId in its 24-hex string form. */
const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** Keep `featured` aligned with the home placement checkbox. */
function withPlacementFlags<T extends { placements?: string[] | null; featured?: boolean }>(input: T) {
  const placements = [...new Set(input.placements ?? [])];
  if (input.featured === true && !placements.includes(ProductPlacementEnum.HOME)) {
    placements.push(ProductPlacementEnum.HOME);
  }
  if (input.featured === false) {
    const withoutHome = placements.filter((p) => p !== ProductPlacementEnum.HOME);
    return { ...input, placements: withoutHome, featured: false };
  }
  return {
    ...input,
    placements,
    featured: placements.includes(ProductPlacementEnum.HOME),
  };
}

/** The catalogue: every piece the house sells. */
class ProductUseCase {
  private buildFilter(query: ListProductsQuery, onlyActive: boolean): FilterQuery<IProduct> {
    return {
      ...(onlyActive
        ? { status: inList(ACTIVE_PRODUCT_STATUSES) }
        : query.status && { status: query.status }),
      ...(query.category && { category: query.category }),
      ...(query.craft && { craft: query.craft }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(query.placement && { placements: query.placement }),
      ...(query.search && searchFilter(["name", "craft", "category"], query.search)),
    };
  }

  private async getOrThrow(id: string) {
    const product = await ProductModel.findById(id).exec();
    if (!product) throw CustomError.notFound("Product");
    return product;
  }

  listProducts(query: ListProductsQuery, { onlyActive }: Visibility) {
    return paginate(ProductModel, {
      filter: this.buildFilter(query, onlyActive),
      page: query.page,
      limit: query.limit,
    });
  }

  async getProductBySlug(slug: string, { onlyActive }: Visibility) {
    const product = await ProductModel.findOne({
      slug,
      ...(onlyActive && { status: inList(ACTIVE_PRODUCT_STATUSES) }),
    }).exec();
    if (!product) throw CustomError.notFound("Product");
    return product;
  }

  /**
   * Public product page lookup: the storefront links by product id
   * (/product/<id>); a slug still resolves so older links keep working.
   */
  async getActiveProductByKey(key: string) {
    const visible = { status: inList(ACTIVE_PRODUCT_STATUSES) };
    if (OBJECT_ID.test(key)) {
      const byId = await ProductModel.findOne({ _id: key, ...visible }).exec();
      if (byId) return byId;
    }
    const bySlug = await ProductModel.findOne({ slug: key.toLowerCase(), ...visible }).exec();
    if (!bySlug) throw CustomError.notFound("Product");
    return bySlug;
  }

  getProduct(id: string) {
    return this.getOrThrow(id);
  }

  /** Active products for these slugs; used to price order requests. */
  findActiveBySlugs(slugs: string[]) {
    return ProductModel.find({
      slug: inList(slugs),
      status: inList(ACTIVE_PRODUCT_STATUSES),
    }).exec();
  }

  async createProduct(input: CreateProductInput) {
    const slug = await resolveSlug(ProductModel, { explicit: input.slug, source: input.name });
    const body = withPlacementFlags(input);
    return ProductModel.create({ ...body, slug });
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const product = await this.getOrThrow(id);
    const slug =
      input.slug && input.slug !== product.slug
        ? await resolveSlug(ProductModel, { explicit: input.slug, source: product.name, excludeId: id })
        : undefined;
    const body =
      input.placements !== undefined || input.featured !== undefined
        ? withPlacementFlags({
            placements: input.placements ?? product.placements ?? [],
            featured: input.featured,
          })
        : {};
    return ProductModel.findByIdAndUpdate(
      id,
      { ...input, ...body, ...(slug && { slug }) },
      { new: true, runValidators: true },
    ).exec();
  }

  /** A piece still featured in The Edit cannot be deleted. */
  async deleteProduct(id: string) {
    await this.getOrThrow(id);
    if (await EditEntryModel.exists({ product: id })) {
      throw CustomError.conflict("This product is in The Edit. Remove it from The Edit first.");
    }
    await ProductModel.findByIdAndDelete(id).exec();
  }
}

export default new ProductUseCase();
