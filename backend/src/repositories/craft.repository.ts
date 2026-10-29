import { CraftModel } from "../models/index.js";
import type { Craft } from "../schemas/craft.schema.js";
import { BaseRepository } from "./base.repository.js";

class CraftRepository extends BaseRepository<Craft> {
  constructor() {
    super(CraftModel);
  }

  findBySlug(slug: string, onlyPublished: boolean) {
    return CraftModel.findOne({ slug, ...(onlyPublished && { status: "published" }) }).exec();
  }
}

export const craftRepository = new CraftRepository();
