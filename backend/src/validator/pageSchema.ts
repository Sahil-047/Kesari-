import * as yup from "yup";
import { PageSlugEnum } from "../util/enum/page.enum.js";

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

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const pageSlugParams = yup.object({
  slug: yup.string().oneOf(Object.values(PageSlugEnum)).required(),
});

/** Section content is shaped by the CMS page definitions; the API stores it as given. */
export const saveDraftSchema = yup.object({
  content: yup
    .mixed<Record<string, unknown>>()
    .required()
    .test("object", "Content must be an object", isRecord)
    .test("safeKeys", 'Keys may not start with "$" or contain "."', (c) => !hasUnsafeKey(c))
    .test("size", "Page content is too large", (c) => JSON.stringify(c).length <= MAX_CONTENT_BYTES),
});

export type SaveDraftInput = yup.InferType<typeof saveDraftSchema>;
