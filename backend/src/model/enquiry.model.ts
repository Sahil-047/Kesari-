import mongoose, { Schema } from "mongoose";
import { EnquiryStatusEnum } from "../util/enum/enquiry.enum.js";
import type { IEnquiry } from "../util/interface/house.interface.js";
import { baseSchemaOptions } from "./shared.js";

const enquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    weddingDate: { type: Date },
    note: { type: String, default: "", maxlength: 4000 },
    source: { type: String, default: "atelier", trim: true, maxlength: 40 },
    status: {
      type: String,
      enum: Object.values(EnquiryStatusEnum),
      default: EnquiryStatusEnum.NEW,
      index: true,
    },
    internalNote: { type: String, maxlength: 4000 },
  },
  baseSchemaOptions,
);

enquirySchema.index({ createdAt: -1 });

const EnquiryModel = mongoose.model<IEnquiry>("Enquiry", enquirySchema);

export default EnquiryModel;
