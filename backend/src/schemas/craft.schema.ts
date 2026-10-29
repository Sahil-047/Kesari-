import { Schema, type InferSchemaType } from "mongoose";
import { baseSchemaOptions, imageSchema, publishStatusField } from "./common.schema.js";

const galleryItemSchema = new Schema(
  {
    image: { type: imageSchema, required: true },
    adjective: { type: String, trim: true, maxlength: 60 },
  },
  { _id: false },
);

/** A craft story page (/crafts/:slug), e.g. "Soft Ivory" or "Warm Saffron". */
export const craftSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    subtitle: { type: String, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 4000 },
    image: { type: imageSchema },
    imagePosition: { type: String, trim: true, maxlength: 40 },
    video: { type: String, trim: true },
    videoPoster: { type: String, trim: true },
    insights: { type: [String], default: [] },
    gallery: { type: [galleryItemSchema], default: [] },
    overlayAlign: { type: String, enum: ["left", "right"], default: "left" },
    sortOrder: { type: Number, default: 0 },
    status: publishStatusField,
  },
  baseSchemaOptions,
);

export type Craft = InferSchemaType<typeof craftSchema>;
