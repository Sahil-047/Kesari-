import mongoose, { Schema } from "mongoose";
import { WomensCategoryEnum } from "../util/enum/product.enum.js";
import type { ICollection } from "../util/interface/catalogue.interface.js";
import { baseSchemaOptions, imageSchema, publishStatusField } from "./shared.js";

const collectionSchema = new Schema<ICollection>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    category: {
      type: String,
      enum: Object.values(WomensCategoryEnum),
      required: true,
      index: true,
    },
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

const CollectionModel = mongoose.model<ICollection>("Collection", collectionSchema);

export default CollectionModel;
