import type { Model } from "mongoose";
import CustomError from "./customError.js";

/** "Ari — Zardoshi Lehenga" -> "ari-zardoshi-lehenga" */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves the slug for a create or update.
 * - An explicit slug must be free (409 otherwise).
 * - A generated slug gets "-2", "-3"… appended until it is free.
 */
export async function resolveSlug<T>(
  model: Model<T>,
  { explicit, source, excludeId }: { explicit?: string; source: string; excludeId?: string },
): Promise<string> {
  if (explicit) {
    const taken = await model.findOne({ slug: explicit }).select("_id").exec();
    if (taken && String(taken._id) !== excludeId) {
      throw CustomError.conflict(`Slug "${explicit}" is already in use`);
    }
    return explicit;
  }

  const base = slugify(source) || "item";
  let candidate = base;
  for (let n = 2; await model.exists({ slug: candidate }); n++) {
    candidate = `${base}-${n}`;
  }
  return candidate;
}
