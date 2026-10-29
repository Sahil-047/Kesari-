import { Schema, type InferSchemaType } from "mongoose";
import { baseSchemaOptions, imageSchema, publishStatusField } from "./common.schema.js";

/** A single piece: kurta, lehenga, saree… shown on product pages and in The Edit. */
export const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    craft: { type: String, required: true, trim: true, maxlength: 120 },
    priceInr: { type: Number, required: true, min: 0 },
    description: { type: String, default: "", maxlength: 4000 },
    details: { type: [String], default: [] },
    note: { type: String, maxlength: 1000 },
    images: { type: [imageSchema], default: [] },
    video: { type: String, trim: true },
    videoPoster: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    status: publishStatusField,
  },
  baseSchemaOptions,
);

productSchema.index({ status: 1, category: 1 });
productSchema.index({ name: "text", craft: "text", category: "text" });

export type Product = InferSchemaType<typeof productSchema>;
