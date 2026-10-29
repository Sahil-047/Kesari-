import { Schema, type SchemaOptions } from "mongoose";

export const PUBLISH_STATUSES = ["draft", "published"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

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
export const imageSchema = new Schema(
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
  enum: PUBLISH_STATUSES,
  default: "draft",
  index: true,
} as const;
