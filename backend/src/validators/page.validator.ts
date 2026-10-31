import { z } from "zod";
import { PAGE_SLUGS } from "../schemas/page.schema.js";

const MAX_CONTENT_BYTES = 512 * 1024;

/** MongoDB rejects keys that start with "$" or contain "."; check every level. */
function hasUnsafeKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasUnsafeKey);
  if (value && typeof value === "object") {
    return Object.entries(value).some(
      ([key, child]) => key.startsWith("$") || key.includes(".") || hasUnsafeKey(child),
    );
  }
  return false;
}

export const pageSlugParams = z.object({ slug: z.enum(PAGE_SLUGS) });

/** Section content is shaped by the CMS page definitions; the API stores it as given. */
export const saveDraftBody = z.object({
  content: z
    .record(z.string(), z.unknown())
    .refine((c) => !hasUnsafeKey(c), { message: 'Keys may not start with "$" or contain "."' })
    .refine((c) => JSON.stringify(c).length <= MAX_CONTENT_BYTES, {
      message: "Page content is too large",
    }),
});

export type SaveDraftInput = z.infer<typeof saveDraftBody>;
