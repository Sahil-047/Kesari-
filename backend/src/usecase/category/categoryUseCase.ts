import CategoryModel from "../../model/category.model.js";
import ProductModel from "../../model/product.model.js";
import CustomError from "../../util/helper/customError.js";
import { slugify } from "../../util/helper/slug.js";

const STARTER: { name: string; slug: string }[] = [
  { name: "Lehenga", slug: "lehenga" },
  { name: "Dress", slug: "dress" },
  { name: "Saree", slug: "saree" },
  { name: "Sherwani", slug: "sherwani" },
  { name: "Kurta", slug: "kurta" },
  { name: "Bandhgala", slug: "bandhgala" },
  { name: "Menswear", slug: "menswear" },
];

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Master catalogue categories — written only via product create/update
 * (`ensureCategory`). The options API is read-only for Studio pickers.
 */
class CategoryUseCase {
  /** Seed starters once, then backfill any free-text product categories. */
  async syncFromProducts() {
    const count = await CategoryModel.countDocuments().exec();
    if (count === 0) {
      await CategoryModel.insertMany(
        STARTER.map((row, i) => ({ ...row, sortOrder: i, isActive: true })),
        { ordered: false },
      ).catch(() => undefined);
    }

    const used = await ProductModel.distinct("category").exec();
    for (const raw of used) {
      if (typeof raw !== "string" || !raw.trim()) continue;
      await this.ensureCategory(raw);
    }
  }

  /**
   * Upsert by slug when a product names a category.
   * Returns the normalised slug stored on the product.
   */
  async ensureCategory(label: string): Promise<string> {
    const trimmed = label.trim();
    if (!trimmed) throw new CustomError("Category is required");
    const slug = slugify(trimmed) || "category";
    const existing = await CategoryModel.findOne({ slug }).exec();
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return existing.slug;
    }
    await CategoryModel.create({
      slug,
      name: /[A-Z]/.test(trimmed) ? trimmed : titleFromSlug(slug),
      sortOrder: await CategoryModel.countDocuments().exec(),
      isActive: true,
    });
    return slug;
  }

  /** Compact list for product / page editors. */
  async listActiveOptions() {
    await this.syncFromProducts();
    return CategoryModel.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug")
      .exec();
  }
}

export default new CategoryUseCase();
