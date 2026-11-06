import EditEntryModel from "../../model/editEntry.model.js";
import ProductModel from "../../model/product.model.js";
import { PublishStatusEnum } from "../../util/enum/common.enum.js";
import { ACTIVE_PRODUCT_STATUSES } from "../../util/enum/product.enum.js";
import CustomError from "../../util/helper/customError.js";
import { inList } from "../../util/helper/regex.js";
import type {
  CreateEditEntryInput,
  ReorderEditInput,
  UpdateEditEntryInput,
} from "../../validator/editEntrySchema.js";

const PRODUCT_FIELDS = "slug name category craft priceInr status";

/** The Edit on What's New: ordered entries, each pointing at a product. */
class EditEntryUseCase {
  private listOrdered(onlyPublished: boolean) {
    return EditEntryModel.find(onlyPublished ? { status: PublishStatusEnum.PUBLISHED } : {})
      .sort({ position: 1, createdAt: 1 })
      .populate({ path: "product", select: PRODUCT_FIELDS })
      .exec();
  }

  private async getOrThrow(id: string) {
    const entry = await EditEntryModel.findById(id)
      .populate({ path: "product", select: PRODUCT_FIELDS })
      .exec();
    if (!entry) throw CustomError.notFound("Edit entry");
    return entry;
  }

  private async assertProductExists(productId: string) {
    if (!(await ProductModel.exists({ _id: productId }))) {
      throw new CustomError("Product does not exist");
    }
  }

  /** Public: published entries whose product is also live. */
  async listPublicEdit() {
    const entries = await this.listOrdered(true);
    return entries.filter((entry) => {
      const product = entry.product as unknown as { status?: string } | null;
      return Boolean(product?.status && ACTIVE_PRODUCT_STATUSES.includes(product.status));
    });
  }

  listEdit() {
    return this.listOrdered(false);
  }

  getEntry(id: string) {
    return this.getOrThrow(id);
  }

  async createEntry(input: CreateEditEntryInput) {
    await this.assertProductExists(input.product);
    const last = await EditEntryModel.findOne().sort({ position: -1 }).select("position").exec();
    const position = input.position ?? (last ? last.position + 1 : 0);
    const entry = await EditEntryModel.create({ ...input, position });
    return this.getOrThrow(entry.id);
  }

  async updateEntry(id: string, input: UpdateEditEntryInput) {
    await this.getOrThrow(id);
    if (input.product) await this.assertProductExists(input.product);
    await EditEntryModel.findByIdAndUpdate(id, input, { runValidators: true }).exec();
    return this.getOrThrow(id);
  }

  async deleteEntry(id: string) {
    await this.getOrThrow(id);
    await EditEntryModel.findByIdAndDelete(id).exec();
  }

  /** Takes the complete new order: every entry exactly once. */
  async reorderEdit({ ids }: ReorderEditInput) {
    const unique = new Set(ids);
    const [total, matched] = await Promise.all([
      EditEntryModel.countDocuments().exec(),
      EditEntryModel.countDocuments({ _id: inList([...unique]) }).exec(),
    ]);
    if (unique.size !== ids.length || matched !== ids.length || total !== ids.length) {
      throw new CustomError("Send every entry of The Edit exactly once");
    }
    await EditEntryModel.bulkWrite(
      ids.map((id, position) => ({
        updateOne: { filter: { _id: id }, update: { $set: { position } } },
      })),
    );
    return this.listOrdered(false);
  }
}

export default new EditEntryUseCase();
