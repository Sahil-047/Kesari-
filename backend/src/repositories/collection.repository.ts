import { CollectionModel } from "../models/index.js";
import type { Collection } from "../schemas/collection.schema.js";
import { BaseRepository } from "./base.repository.js";

class CollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super(CollectionModel);
  }

  findBySlug(slug: string, onlyPublished: boolean) {
    return CollectionModel.findOne({
      slug,
      ...(onlyPublished && { status: "published" }),
    }).exec();
  }
}

export const collectionRepository = new CollectionRepository();
