import mongoose, { Schema } from "mongoose";
import { BuyActionEnum, PRODUCT_SIZE_LABELS, ProductStatusEnum } from "../util/enum/product.enum.js";
import type { IProduct } from "../util/interface/catalogue.interface.js";
import { baseSchemaOptions, imageSchema } from "./shared.js";

const defaultSizeStock = () => PRODUCT_SIZE_LABELS.map((size) => ({ size, quantity: 1 }));

const sizeStockSchema = new Schema(
  {
    size: { type: String, enum: [...PRODUCT_SIZE_LABELS], required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    craft: { type: String, default: "", trim: true, maxlength: 120 },
    priceInr: { type: Number, required: true, min: 0 },
    blouseName: { type: String, default: "Blouse", trim: true, maxlength: 80 },
    blousePriceInr: { type: Number, default: 0, min: 0 },
    dupattaName: { type: String, default: "Dupatta", trim: true, maxlength: 80 },
    dupattaPriceInr: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "", maxlength: 4000 },
    details: { type: [String], default: [] },
    note: { type: String, maxlength: 1000 },
    images: { type: [imageSchema], default: [] },
    video: { type: String, trim: true },
    videoPoster: { type: String, trim: true },
    sizeGuideImage: { type: String, trim: true },
    buyAction: { type: String, enum: Object.values(BuyActionEnum), default: BuyActionEnum.BUY_NOW },
    sizing: {
      enabled: { type: Boolean, default: true },
      allowCustom: { type: Boolean, default: true },
      stock: { type: [sizeStockSchema], default: defaultSizeStock },
    },
    featured: { type: Boolean, default: false },
    placements: { type: [String], default: ["shop"] },
    status: {
      type: String,
      enum: Object.values(ProductStatusEnum),
      default: ProductStatusEnum.INACTIVE,
      index: true,
    },
  },
  baseSchemaOptions,
);

productSchema.index({ status: 1, category: 1 });
productSchema.index({ name: "text", craft: "text", category: "text" });

const ProductModel = mongoose.model<IProduct>("Product", productSchema);

export default ProductModel;
