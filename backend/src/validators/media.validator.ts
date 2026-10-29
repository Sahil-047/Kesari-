import { z } from "zod";
import { paginationQuery } from "./common.validator.js";

/** Multipart text fields sent alongside the uploaded file. */
export const uploadMediaBody = z.object({
  alt: z.string().trim().max(300).default(""),
});

export const updateMediaBody = z.object({
  alt: z.string().trim().max(300),
});

export const listMediaQuery = paginationQuery.extend({
  type: z.enum(["image", "video"]).optional(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaBody>;
export type UpdateMediaInput = z.infer<typeof updateMediaBody>;
export type ListMediaQuery = z.infer<typeof listMediaQuery>;
