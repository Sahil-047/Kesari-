import { z } from "zod";
import { WOMENS_CATEGORIES } from "../schemas/collection.schema.js";
import {
  imageInput,
  paginationQuery,
  publishStatus,
  slug,
  textList,
} from "./common.validator.js";

export const createCollectionBody = z.object({
  title: z.string().trim().min(1).max(160),
  slug: slug.optional(),
  label: z.string().trim().min(1).max(80),
  category: z.enum(WOMENS_CATEGORIES),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #e8c4c0"),
  description: z.string().max(2000).optional(),
  story: z.string().max(4000).optional(),
  notes: textList.default([]),
  images: z.array(imageInput).max(20).default([]),
  href: z.string().trim().max(300).optional(),
  sortOrder: z.number().int().default(0),
  status: publishStatus.default("draft"),
});

export const updateCollectionBody = createCollectionBody.partial();

export const listCollectionsQuery = paginationQuery.extend({
  category: z.enum(WOMENS_CATEGORIES).optional(),
  status: publishStatus.optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionBody>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionBody>;
export type ListCollectionsQuery = z.infer<typeof listCollectionsQuery>;
