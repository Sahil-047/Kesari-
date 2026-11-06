import * as yup from "yup";
import { PRODUCT_PLACEMENTS } from "../util/enum/placement.enum.js";
import { BuyActionEnum, ProductStatusEnum } from "../util/enum/product.enum.js";
import { assetUrl, imageInput, paginationQuery, slug, textList } from "./commonSchema.js";

/** Field rules shared by create and update; update makes every one optional. */
const fields = {
  name: yup.string().trim().min(1).max(160),
  slug: slug().optional(), // generated from the name when omitted
  category: yup.string().trim().min(1).max(80),
  craft: yup.string().trim().max(120),
  priceInr: yup.number().integer().min(0),
  description: yup.string().max(4000),
  details: textList(),
  note: yup.string().max(1000).optional(),
  images: yup.array(imageInput().required()).max(20),
  video: assetUrl().optional(),
  videoPoster: assetUrl().optional(),
  buyAction: yup.string().oneOf(Object.values(BuyActionEnum)),
  featured: yup.boolean(),
  placements: yup
    .array(yup.string().oneOf([...PRODUCT_PLACEMENTS]).required())
    .ensure()
    .max(PRODUCT_PLACEMENTS.length),
  status: yup.string().oneOf(Object.values(ProductStatusEnum)),
};

export const createProductSchema = yup.object({
  ...fields,
  name: fields.name.required(),
  category: fields.category.required(),
  craft: fields.craft.default(""),
  priceInr: fields.priceInr.required(),
  description: fields.description.default(""),
  details: fields.details.default([]),
  images: fields.images.default([]),
  buyAction: fields.buyAction.default(BuyActionEnum.BUY_NOW),
  featured: fields.featured.default(false),
  placements: fields.placements.default(["shop"]),
  status: fields.status.default(ProductStatusEnum.INACTIVE),
});

export const listProductsSchema = paginationQuery.shape({
  category: yup.string().trim().optional(),
  craft: yup.string().trim().optional(),
  featured: yup.boolean().optional(),
  placement: yup.string().oneOf([...PRODUCT_PLACEMENTS]).optional(),
  search: yup.string().trim().max(100).optional(),
  status: yup.string().oneOf(Object.values(ProductStatusEnum)).optional(), // admin only
});

export const updateProductSchema = yup.object(fields);

/** Public product lookup key: a product id or a slug. */
export const productKeyParams = yup.object({
  key: yup
    .string()
    .trim()
    .matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, "Use a product id or slug")
    .max(160)
    .required(),
});

export type CreateProductInput = yup.InferType<typeof createProductSchema>;
export type UpdateProductInput = yup.InferType<typeof updateProductSchema>;
export type ListProductsQuery = yup.InferType<typeof listProductsSchema>;
