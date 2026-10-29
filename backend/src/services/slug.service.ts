import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";

type SlugLookup = {
  exists(filter: { slug: string }): Promise<boolean>;
  findOne(filter: { slug: string }): Promise<{ id?: string } | null>;
};

/**
 * Resolves the slug for a create or update.
 * - An explicit slug must be free (409 otherwise).
 * - A generated slug gets "-2", "-3"… appended until it is free.
 */
export async function resolveSlug(
  repo: SlugLookup,
  { explicit, source, excludeId }: { explicit?: string; source: string; excludeId?: string },
): Promise<string> {
  if (explicit) {
    const taken = await repo.findOne({ slug: explicit });
    if (taken && taken.id !== excludeId) throw ApiError.conflict(`Slug "${explicit}" is already in use`);
    return explicit;
  }

  const base = slugify(source) || "item";
  let candidate = base;
  for (let n = 2; await repo.exists({ slug: candidate }); n++) {
    candidate = `${base}-${n}`;
  }
  return candidate;
}
