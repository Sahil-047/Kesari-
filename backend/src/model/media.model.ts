import mongoose, { Schema } from "mongoose";
import type { IMedia } from "../util/interface/house.interface.js";
import { baseSchemaOptions } from "./shared.js";

const mediaSchema = new Schema<IMedia>(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    originalName: { type: String, trim: true, maxlength: 300 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    alt: { type: String, default: "", trim: true, maxlength: 300 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  baseSchemaOptions,
);

mediaSchema.index({ createdAt: -1 });

const MediaModel = mongoose.model<IMedia>("Media", mediaSchema);

export default MediaModel;
