import { Schema, type InferSchemaType } from "mongoose";
import { baseSchemaOptions, imageSchema, publishStatusField } from "./common.schema.js";

export const WOMENS_CATEGORIES = ["lehenga", "dress", "saree"] as const;
export type WomensCategory = (typeof WOMENS_CATEGORIES)[number];

/** A colour collection on Womenswear, e.g. "Radhika Saree" in Light Pink. */
export const collectionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, enum: WOMENS_CATEGORIES, required: true, index: true },
    accent: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
    description: { type: String, maxlength: 2000 },
    story: { type: String, maxlength: 4000 },
    notes: { type: [String], default: [] },
    images: { type: [imageSchema], default: [] },
    href: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    status: publishStatusField,
  },
  baseSchemaOptions,
);

export type Collection = InferSchemaType<typeof collectionSchema>;
