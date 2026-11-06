import type { Document, Types } from "mongoose";
import type { OverlayAlignEnum, PublishStatusEnum } from "../enum/common.enum.js";
import type { BuyActionEnum, ProductStatusEnum, WomensCategoryEnum } from "../enum/product.enum.js";
import type { IImage } from "./common.interface.js";

/** A single piece: kurta, lehenga, saree… shown on product pages and in The Edit. */
export interface IProduct extends Document {
  slug: string;
  name: string;
  category: string;
  /** Optional craft label, kept for storefront stories. */
  craft: string;
  priceInr: number;
  description: string;
  details: string[];
  note?: string;
  images: IImage[];
  video?: string;
  videoPoster?: string;
  buyAction: BuyActionEnum;
  /** @deprecated Prefer placements includes "home"; kept in sync for older clients. */
  featured: boolean;
  /** Storefront surfaces this active product may auto-appear on. */
  placements: string[];
  status: ProductStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICraftGalleryItem {
  image: IImage;
  adjective?: string;
}

/** A craft story page (/crafts/:slug), e.g. "Soft Ivory" or "Warm Saffron". */
export interface ICraft extends Document {
  slug: string;
  label: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: IImage;
  imagePosition?: string;
  video?: string;
  videoPoster?: string;
  insights: string[];
  gallery: ICraftGalleryItem[];
  overlayAlign: OverlayAlignEnum;
  sortOrder: number;
  status: PublishStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

/** A colour collection on Womenswear, e.g. "Radhika Saree" in Light Pink. */
export interface ICollection extends Document {
  slug: string;
  title: string;
  label: string;
  category: WomensCategoryEnum;
  accent: string;
  description?: string;
  story?: string;
  notes: string[];
  images: IImage[];
  href?: string;
  sortOrder: number;
  status: PublishStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

/** One piece in The Edit on What's New, in display order. */
export interface IEditEntry extends Document {
  product: Types.ObjectId | IProduct;
  coverImage: IImage;
  position: number;
  status: PublishStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}
