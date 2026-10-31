import { Schema, Types, type InferSchemaType } from "mongoose";
import { baseSchemaOptions } from "./common.schema.js";

/** The editable pages of the site. Their sections are defined by the CMS. */
export const PAGE_SLUGS = [
  "home",
  "whats-new",
  "weddings",
  "womenswear",
  "menswear",
  "atelier",
  "world-of-kesari",
  "footer",
  "site",
] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

/**
 * One document per page. Editors work on `draft`; publishing copies it to
 * `published`, which is the only version the public site reads.
 */
export const pageSchema = new Schema(
  {
    slug: { type: String, enum: PAGE_SLUGS, required: true, unique: true },
    draft: { type: Schema.Types.Mixed, default: {} },
    published: { type: Schema.Types.Mixed, default: null },
    publishedAt: { type: Date },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    publishedBy: { type: Types.ObjectId, ref: "User" },
  },
  { ...baseSchemaOptions, minimize: false },
);

export type Page = InferSchemaType<typeof pageSchema>;
