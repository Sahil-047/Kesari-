import { trusted } from "mongoose";
import { EditEntryModel } from "../models/index.js";
import type { EditEntry } from "../schemas/editEntry.schema.js";
import { BaseRepository } from "./base.repository.js";

const PRODUCT_FIELDS = "slug name category craft priceInr status";

class EditEntryRepository extends BaseRepository<EditEntry> {
  constructor() {
    super(EditEntryModel);
  }

  /** The Edit in display order, with each entry's product summary. */
  listOrdered(onlyPublished: boolean) {
    return EditEntryModel.find(onlyPublished ? { status: "published" } : {})
      .sort({ position: 1, createdAt: 1 })
      .populate({ path: "product", select: PRODUCT_FIELDS })
      .exec();
  }

  findByIdWithProduct(id: string) {
    return EditEntryModel.findById(id)
      .populate({ path: "product", select: PRODUCT_FIELDS })
      .exec();
  }

  async nextPosition(): Promise<number> {
    const last = await EditEntryModel.findOne().sort({ position: -1 }).select("position").exec();
    return last ? last.position + 1 : 0;
  }

  /** Writes every position in one round trip. */
  async reorder(ids: string[]): Promise<void> {
    await EditEntryModel.bulkWrite(
      ids.map((id, position) => ({
        updateOne: { filter: { _id: id }, update: { $set: { position } } },
      })),
    );
  }

  countByIds(ids: string[]) {
    // trusted(): our own operator, exempt from the global sanitizeFilter.
    return EditEntryModel.countDocuments({ _id: trusted({ $in: ids }) }).exec();
  }
}

export const editEntryRepository = new EditEntryRepository();
