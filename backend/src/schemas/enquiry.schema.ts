import { Schema, type InferSchemaType } from "mongoose";
import { baseSchemaOptions } from "./common.schema.js";

export const ENQUIRY_STATUSES = ["new", "in_progress", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

/** A note written to the house from the Atelier page. */
export const enquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    weddingDate: { type: Date },
    note: { type: String, default: "", maxlength: 4000 },
    source: { type: String, default: "atelier", trim: true, maxlength: 40 },
    status: { type: String, enum: ENQUIRY_STATUSES, default: "new", index: true },
    internalNote: { type: String, maxlength: 4000 },
  },
  baseSchemaOptions,
);

enquirySchema.index({ createdAt: -1 });

export type Enquiry = InferSchemaType<typeof enquirySchema>;
