import mongoose, { Schema } from "mongoose";
import { OverlayAlignEnum } from "../util/enum/common.enum.js";
import type { ICraft, ICraftGalleryItem } from "../util/interface/catalogue.interface.js";
import { baseSchemaOptions, imageSchema, publishStatusField } from "./shared.js";

const galleryItemSchema = new Schema<ICraftGalleryItem>(
  {
    image: { type: imageSchema, required: true },
    adjective: { type: String, trim: true, maxlength: 60 },
  },
  { _id: false },
);

const craftSchema = new Schema<ICraft>(
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
    overlayAlign: {
      type: String,
      enum: Object.values(OverlayAlignEnum),
      default: OverlayAlignEnum.LEFT,
    },
    sortOrder: { type: Number, default: 0 },
    status: publishStatusField,
  },
  baseSchemaOptions,
);

const CraftModel = mongoose.model<ICraft>("Craft", craftSchema);

export default CraftModel;
