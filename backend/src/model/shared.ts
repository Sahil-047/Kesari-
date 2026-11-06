import { Schema, type SchemaOptions } from "mongoose";
import { PublishStatusEnum } from "../util/enum/common.enum.js";
import type { IImage } from "../util/interface/common.interface.js";

/** Shared options: timestamps, and JSON output with `id` instead of `_id`/`__v`. */
export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      delete ret._id;
      return ret;
    },
  },
} satisfies SchemaOptions;

/** An image stored on S3 (or a site-relative path for existing assets). */
export const imageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true, trim: true },
    key: { type: String, trim: true },
    alt: { type: String, default: "", trim: true, maxlength: 300 },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
  },
  { _id: false },
);

export const publishStatusField = {
  type: String,
  enum: Object.values(PublishStatusEnum),
  default: PublishStatusEnum.DRAFT,
  index: true,
};
