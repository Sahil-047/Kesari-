import CollectionModel from "../../model/collection.model.js";
import { PublishStatusEnum } from "../../util/enum/common.enum.js";
import CustomError from "../../util/helper/customError.js";
import { paginate } from "../../util/helper/paginate.js";
import { resolveSlug } from "../../util/helper/slug.js";
import type {
  CreateCollectionInput,
  ListCollectionsQuery,
  UpdateCollectionInput,
} from "../../validator/collectionSchema.js";

type Visibility = { onlyPublished: boolean };

/** Colour collections on Womenswear. */
class CollectionUseCase {
  private async getOrThrow(id: string) {
    const collection = await CollectionModel.findById(id).exec();
    if (!collection) throw CustomError.notFound("Collection");
    return collection;
  }

  listCollections(query: ListCollectionsQuery, { onlyPublished }: Visibility) {
    const status = onlyPublished ? PublishStatusEnum.PUBLISHED : query.status;
    return paginate(CollectionModel, {
      filter: {
        ...(status && { status }),
        ...(query.category && { category: query.category }),
      },
      sort: { sortOrder: 1, createdAt: 1 },
      page: query.page,
      limit: query.limit,
    });
  }

  async getCollectionBySlug(slug: string, { onlyPublished }: Visibility) {
    const collection = await CollectionModel.findOne({
      slug,
      ...(onlyPublished && { status: PublishStatusEnum.PUBLISHED }),
    }).exec();
    if (!collection) throw CustomError.notFound("Collection");
    return collection;
  }

  getCollection(id: string) {
    return this.getOrThrow(id);
  }

  async createCollection(input: CreateCollectionInput) {
    const slug = await resolveSlug(CollectionModel, { explicit: input.slug, source: input.title });
    return CollectionModel.create({ ...input, slug });
  }

  async updateCollection(id: string, input: UpdateCollectionInput) {
    const collection = await this.getOrThrow(id);
    const slug =
      input.slug && input.slug !== collection.slug
        ? await resolveSlug(CollectionModel, {
            explicit: input.slug,
            source: collection.title,
            excludeId: id,
          })
        : undefined;
    return CollectionModel.findByIdAndUpdate(
      id,
      { ...input, ...(slug && { slug }) },
      { new: true, runValidators: true },
    ).exec();
  }

  async deleteCollection(id: string) {
    await this.getOrThrow(id);
    await CollectionModel.findByIdAndDelete(id).exec();
  }
}

export default new CollectionUseCase();
