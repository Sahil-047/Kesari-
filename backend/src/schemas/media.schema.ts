import { Schema, Types, type InferSchemaType } from "mongoose";
import { baseSchemaOptions } from "./common.schema.js";

/** A file uploaded to S3 through the CMS media library. */
export const mediaSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    originalName: { type: String, trim: true, maxlength: 300 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    alt: { type: String, default: "", trim: true, maxlength: 300 },
    uploadedBy: { type: Types.ObjectId, ref: "User" },
  },
  baseSchemaOptions,
);

mediaSchema.index({ createdAt: -1 });

export type Media = InferSchemaType<typeof mediaSchema>;
