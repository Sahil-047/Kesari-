import mongoose, { Schema } from "mongoose";
import { baseSchemaOptions } from "./shared.js";

export type ICategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  baseSchemaOptions,
);

categorySchema.index({ name: 1 });

const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);

export default CategoryModel;
