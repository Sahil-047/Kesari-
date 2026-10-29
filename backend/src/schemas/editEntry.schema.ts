import { Schema, Types, type InferSchemaType } from "mongoose";
import { baseSchemaOptions, imageSchema, publishStatusField } from "./common.schema.js";

/** One piece in The Edit on What's New, in display order. */
export const editEntrySchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true },
    coverImage: { type: imageSchema, required: true },
    position: { type: Number, required: true, default: 0, index: true },
    status: publishStatusField,
  },
  baseSchemaOptions,
);

export type EditEntry = InferSchemaType<typeof editEntrySchema>;
