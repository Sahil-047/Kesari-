import mongoose, { Schema } from "mongoose";
import type { IEditEntry } from "../util/interface/catalogue.interface.js";
import { baseSchemaOptions, imageSchema, publishStatusField } from "./shared.js";

const editEntrySchema = new Schema<IEditEntry>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    coverImage: { type: imageSchema, required: true },
    position: { type: Number, required: true, default: 0, index: true },
    status: publishStatusField,
  },
  baseSchemaOptions,
);

const EditEntryModel = mongoose.model<IEditEntry>("EditEntry", editEntrySchema);

export default EditEntryModel;
