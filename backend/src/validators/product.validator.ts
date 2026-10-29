import { z } from "zod";
import {
  assetUrl,
  imageInput,
  paginationQuery,
  publishStatus,
  slug,
  textList,
} from "./common.validator.js";

export const createProductBody = z.object({
  name: z.string().trim().min(1).max(160),
  slug: slug.optional(), // generated from the name when omitted
  category: z.string().trim().min(1).max(80),
  craft: z.string().trim().min(1).max(120),
  priceInr: z.number().int().min(0),
  description: z.string().max(4000).default(""),
  details: textList.default([]),
  note: z.string().max(1000).optional(),
  images: z.array(imageInput).max(20).default([]),
  video: assetUrl.optional(),
  videoPoster: assetUrl.optional(),
  featured: z.boolean().default(false),
  status: publishStatus.default("draft"),
});

export const updateProductBody = createProductBody.partial();

export const listProductsQuery = paginationQuery.extend({
  category: z.string().trim().optional(),
  craft: z.string().trim().optional(),
  featured: z.stringbool().optional(),
  search: z.string().trim().max(100).optional(),
  status: publishStatus.optional(), // admin only; public lists are always published
});

export type CreateProductInput = z.infer<typeof createProductBody>;
export type UpdateProductInput = z.infer<typeof updateProductBody>;
export type ListProductsQuery = z.infer<typeof listProductsQuery>;
