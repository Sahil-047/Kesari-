import * as yup from "yup";
import { OverlayAlignEnum, PublishStatusEnum } from "../util/enum/common.enum.js";
import {
  assetUrl,
  imageInput,
  optionalImage,
  paginationQuery,
  publishStatus,
  slug,
  textList,
} from "./commonSchema.js";

const fields = {
  title: yup.string().trim().min(1).max(160),
  slug: slug().optional(),
  label: yup.string().trim().min(1).max(80),
  subtitle: yup.string().trim().max(200).optional(),
  description: yup.string().max(4000),
  image: optionalImage(),
  imagePosition: yup.string().trim().max(40).optional(),
  video: assetUrl().optional(),
  videoPoster: assetUrl().optional(),
  insights: textList(),
  gallery: yup
    .array(
      yup
        .object({
          image: imageInput().required(),
          adjective: yup.string().trim().max(60).optional(),
        })
        .required(),
    )
    .max(30),
  overlayAlign: yup.string().oneOf(Object.values(OverlayAlignEnum)),
  sortOrder: yup.number().integer(),
  status: publishStatus(),
};

export const createCraftSchema = yup.object({
  ...fields,
  title: fields.title.required(),
  label: fields.label.required(),
  description: fields.description.default(""),
  insights: fields.insights.default([]),
  gallery: fields.gallery.default([]),
  overlayAlign: fields.overlayAlign.default(OverlayAlignEnum.LEFT),
  sortOrder: fields.sortOrder.default(0),
  status: fields.status.default(PublishStatusEnum.DRAFT),
});

export const updateCraftSchema = yup.object(fields);

export const listCraftsSchema = paginationQuery.shape({
  status: publishStatus().optional(),
});

export type CreateCraftInput = yup.InferType<typeof createCraftSchema>;
export type UpdateCraftInput = yup.InferType<typeof updateCraftSchema>;
export type ListCraftsQuery = yup.InferType<typeof listCraftsSchema>;
