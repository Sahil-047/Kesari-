import { z } from "zod";
import {
  assetUrl,
  imageInput,
  paginationQuery,
  publishStatus,
  slug,
  textList,
} from "./common.validator.js";

export const createCraftBody = z.object({
  title: z.string().trim().min(1).max(160),
  slug: slug.optional(),
  label: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(200).optional(),
  description: z.string().max(4000).default(""),
  image: imageInput.optional(),
  imagePosition: z.string().trim().max(40).optional(),
  video: assetUrl.optional(),
  videoPoster: assetUrl.optional(),
  insights: textList.default([]),
  gallery: z
    .array(z.object({ image: imageInput, adjective: z.string().trim().max(60).optional() }))
    .max(30)
    .default([]),
  overlayAlign: z.enum(["left", "right"]).default("left"),
  sortOrder: z.number().int().default(0),
  status: publishStatus.default("draft"),
});

export const updateCraftBody = createCraftBody.partial();

export const listCraftsQuery = paginationQuery.extend({
  status: publishStatus.optional(),
});

export type CreateCraftInput = z.infer<typeof createCraftBody>;
export type UpdateCraftInput = z.infer<typeof updateCraftBody>;
export type ListCraftsQuery = z.infer<typeof listCraftsQuery>;
