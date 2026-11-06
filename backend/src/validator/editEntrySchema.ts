import * as yup from "yup";
import { PublishStatusEnum } from "../util/enum/common.enum.js";
import { imageInput, objectId, optionalImage, publishStatus } from "./commonSchema.js";

export const createEditEntrySchema = yup.object({
  product: objectId().required(),
  coverImage: imageInput().required(),
  position: yup.number().integer().min(0).optional(), // appended to the end when omitted
  status: publishStatus().default(PublishStatusEnum.DRAFT),
});

export const updateEditEntrySchema = yup.object({
  product: objectId().optional(),
  coverImage: optionalImage(),
  position: yup.number().integer().min(0).optional(),
  status: publishStatus().optional(),
});

/** The full desired order of The Edit, first to last. */
export const reorderEditSchema = yup.object({
  ids: yup.array(objectId().required()).min(1).max(100).required(),
});

export type CreateEditEntryInput = yup.InferType<typeof createEditEntrySchema>;
export type UpdateEditEntryInput = yup.InferType<typeof updateEditEntrySchema>;
export type ReorderEditInput = yup.InferType<typeof reorderEditSchema>;
