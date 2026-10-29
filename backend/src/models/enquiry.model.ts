import { model } from "mongoose";
import { enquirySchema } from "../schemas/enquiry.schema.js";

export const EnquiryModel = model("Enquiry", enquirySchema);
