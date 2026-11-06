import * as yup from "yup";
import { PublishStatusEnum } from "../util/enum/common.enum.js";
import { WomensCategoryEnum } from "../util/enum/product.enum.js";
import { imageInput, paginationQuery, publishStatus, slug, textList } from "./commonSchema.js";

const category = () => yup.string().oneOf(Object.values(WomensCategoryEnum));

const fields = {
  title: yup.string().trim().min(1).max(160),
  slug: slug().optional(),
  label: yup.string().trim().min(1).max(80),
  category: category(),
  accent: yup.string().matches(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #e8c4c0"),
  description: yup.string().max(2000).optional(),
  story: yup.string().max(4000).optional(),
  notes: textList(),
  images: yup.array(imageInput().required()).max(20),
  href: yup.string().trim().max(300).optional(),
  sortOrder: yup.number().integer(),
  status: publishStatus(),
};

export const createCollectionSchema = yup.object({
  ...fields,
  title: fields.title.required(),
  label: fields.label.required(),
  category: fields.category.required(),
  accent: fields.accent.required(),
  notes: fields.notes.default([]),
  images: fields.images.default([]),
  sortOrder: fields.sortOrder.default(0),
  status: fields.status.default(PublishStatusEnum.DRAFT),
});

export const updateCollectionSchema = yup.object(fields);

export const listCollectionsSchema = paginationQuery.shape({
  category: category().optional(),
  status: publishStatus().optional(),
});

export type CreateCollectionInput = yup.InferType<typeof createCollectionSchema>;
export type UpdateCollectionInput = yup.InferType<typeof updateCollectionSchema>;
export type ListCollectionsQuery = yup.InferType<typeof listCollectionsSchema>;
