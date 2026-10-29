import { z } from "zod";
import { imageInput, objectId, publishStatus } from "./common.validator.js";

export const createEditEntryBody = z.object({
  product: objectId,
  coverImage: imageInput,
  position: z.number().int().min(0).optional(), // appended to the end when omitted
  status: publishStatus.default("draft"),
});

export const updateEditEntryBody = createEditEntryBody.partial();

/** The full desired order of The Edit, first to last. */
export const reorderEditBody = z.object({
  ids: z.array(objectId).min(1).max(100),
});

export type CreateEditEntryInput = z.infer<typeof createEditEntryBody>;
export type UpdateEditEntryInput = z.infer<typeof updateEditEntryBody>;
export type ReorderEditInput = z.infer<typeof reorderEditBody>;
