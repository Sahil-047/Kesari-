import { collectionRepository } from "../repositories/collection.repository.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreateCollectionInput,
  ListCollectionsQuery,
  UpdateCollectionInput,
} from "../validators/collection.validator.js";
import { resolveSlug } from "./slug.service.js";

async function getOrThrow(id: string) {
  const collection = await collectionRepository.findById(id);
  if (!collection) throw ApiError.notFound("Collection");
  return collection;
}

export const collectionService = {
  list(query: ListCollectionsQuery, { onlyPublished }: { onlyPublished: boolean }) {
    const status = onlyPublished ? "published" : query.status;
    return collectionRepository.list({
      filter: {
        ...(status && { status }),
        ...(query.category && { category: query.category }),
      },
      sort: { sortOrder: 1, createdAt: 1 },
      page: query.page,
      limit: query.limit,
    });
  },

  async getBySlug(slug: string, { onlyPublished }: { onlyPublished: boolean }) {
    const collection = await collectionRepository.findBySlug(slug, onlyPublished);
    if (!collection) throw ApiError.notFound("Collection");
    return collection;
  },

  get: getOrThrow,

  async create(input: CreateCollectionInput) {
    const slug = await resolveSlug(collectionRepository, {
      explicit: input.slug,
      source: input.title,
    });
    return collectionRepository.create({ ...input, slug });
  },

  async update(id: string, input: UpdateCollectionInput) {
    const collection = await getOrThrow(id);
    const slug =
      input.slug && input.slug !== collection.slug
        ? await resolveSlug(collectionRepository, {
            explicit: input.slug,
            source: collection.title,
            excludeId: id,
          })
        : undefined;
    return collectionRepository.updateById(id, { ...input, ...(slug && { slug }) });
  },

  async remove(id: string) {
    await getOrThrow(id);
    await collectionRepository.deleteById(id);
  },
};
