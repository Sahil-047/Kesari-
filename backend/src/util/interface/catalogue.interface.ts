import type { Document } from "mongoose";
import type { BuyActionEnum, ProductSizeLabel, ProductStatusEnum } from "../enum/product.enum.js";
import type { IImage } from "./common.interface.js";

/** How many units are available for one labelled size. */
export interface IProductSizeStock {
  size: ProductSizeLabel;
  quantity: number;
}

/** Size request controls for the product enquiry page. */
export interface IProductSizing {
  /** When false, the size picker is hidden (e.g. saree-only pieces). */
  enabled: boolean;
  /** Show a Custom / made-to-measure option beside labelled sizes. */
  allowCustom: boolean;
  /** Quantity remaining per labelled size; 0 hides that size on the site. */
  stock: IProductSizeStock[];
}

/** A single piece: kurta, lehenga, saree… shown on product pages and placements. */
export interface IProduct extends Document {
  slug: string;
  name: string;
  category: string;
  /** Optional craft label, kept for storefront stories. */
  craft: string;
  /** Base lookbook price in INR. */
  priceInr: number;
  /** Display name for the blouse-style add-on (per product). */
  blouseName: string;
  /** Optional blouse add-on price; 0 = not offered. */
  blousePriceInr: number;
  /** Display name for the dupatta-style add-on (per product). */
  dupattaName: string;
  /** Optional dupatta add-on price; 0 = not offered. */
  dupattaPriceInr: number;
  description: string;
  details: string[];
  note?: string;
  images: IImage[];
  video?: string;
  videoPoster?: string;
  /** Optional chart / fit guide image for the size & fit panel. */
  sizeGuideImage?: string;
  buyAction: BuyActionEnum;
  sizing: IProductSizing;
  /** @deprecated Prefer placements includes "home"; kept in sync for older clients. */
  featured: boolean;
  /** Storefront surfaces this active product may auto-appear on. */
  placements: string[];
  status: ProductStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}
