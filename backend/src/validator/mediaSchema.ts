import * as yup from "yup";
import { blankToUndefined, paginationQuery } from "./commonSchema.js";

/** Multipart text fields sent alongside the uploaded file. */
export const uploadMediaSchema = yup.object({
  alt: yup.string().trim().max(300).default(""),
  /** Optional subfolder under media/, e.g. products/soft-ivory. */
  folder: yup
    .string()
    .trim()
    .transform(blankToUndefined)
    .max(120)
    .matches(/^[a-z0-9]+(?:[/_-][a-z0-9]+)*$/i, "Use letters, numbers, /, -, _ only")
    .optional(),
});

export const updateMediaSchema = yup.object({
  alt: yup.string().trim().max(300).required(),
});

export const listMediaSchema = paginationQuery.shape({
  type: yup.string().oneOf(["image", "video"] as const).optional(),
});

export type UploadMediaInput = yup.InferType<typeof uploadMediaSchema>;
export type UpdateMediaInput = yup.InferType<typeof updateMediaSchema>;
export type ListMediaQuery = yup.InferType<typeof listMediaSchema>;
