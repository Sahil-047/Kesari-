import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { PUBLISH_STATUSES } from "../schemas/common.schema.js";

export const objectId = z
  .string()
  .refine((v) => isValidObjectId(v), { message: "Invalid id" });

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

export const idParams = z.object({ id: objectId });
export const slugParams = z.object({ slug });

export const publishStatus = z.enum(PUBLISH_STATUSES);

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Absolute URL, or a site-relative path for assets already in the frontend. */
export const assetUrl = z
  .string()
  .trim()
  .refine((v) => v.startsWith("/") || URL.canParse(v), { message: "Invalid URL" });

export const imageInput = z.object({
  url: assetUrl,
  key: z.string().trim().optional(),
  alt: z.string().trim().max(300).default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const textList = z.array(z.string().trim().min(1).max(500)).max(50);
