import mongoose, { Schema } from "mongoose";
import { PageSlugEnum } from "../util/enum/page.enum.js";
import type { IPage } from "../util/interface/house.interface.js";
import { baseSchemaOptions } from "./shared.js";

const pageSchema = new Schema<IPage>(
  {
    slug: { type: String, enum: Object.values(PageSlugEnum), required: true, unique: true },
    draft: { type: Schema.Types.Mixed, default: {} },
    published: { type: Schema.Types.Mixed, default: null },
    publishedAt: { type: Date },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { ...baseSchemaOptions, minimize: false },
);

const PageModel = mongoose.model<IPage>("Page", pageSchema);

export default PageModel;
