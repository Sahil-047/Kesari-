import { model } from "mongoose";
import { productSchema } from "../schemas/product.schema.js";

export const ProductModel = model("Product", productSchema);
