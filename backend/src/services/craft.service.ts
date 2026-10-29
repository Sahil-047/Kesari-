import { craftRepository } from "../repositories/craft.repository.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreateCraftInput,
  ListCraftsQuery,
  UpdateCraftInput,
} from "../validators/craft.validator.js";
import { resolveSlug } from "./slug.service.js";

async function getOrThrow(id: string) {
  const craft = await craftRepository.findById(id);
  if (!craft) throw ApiError.notFound("Craft");
  return craft;
}

export const craftService = {
  list(query: ListCraftsQuery, { onlyPublished }: { onlyPublished: boolean }) {
    const status = onlyPublished ? "published" : query.status;
    return craftRepository.list({
      filter: status ? { status } : {},
      sort: { sortOrder: 1, createdAt: 1 },
      page: query.page,
      limit: query.limit,
    });
  },

  async getBySlug(slug: string, { onlyPublished }: { onlyPublished: boolean }) {
    const craft = await craftRepository.findBySlug(slug, onlyPublished);
    if (!craft) throw ApiError.notFound("Craft");
    return craft;
  },

  get: getOrThrow,

  async create(input: CreateCraftInput) {
    const slug = await resolveSlug(craftRepository, { explicit: input.slug, source: input.title });
    return craftRepository.create({ ...input, slug });
  },

  async update(id: string, input: UpdateCraftInput) {
    const craft = await getOrThrow(id);
    const slug =
      input.slug && input.slug !== craft.slug
        ? await resolveSlug(craftRepository, { explicit: input.slug, source: craft.title, excludeId: id })
        : undefined;
    return craftRepository.updateById(id, { ...input, ...(slug && { slug }) });
  },

  async remove(id: string) {
    await getOrThrow(id);
    await craftRepository.deleteById(id);
  },
};
