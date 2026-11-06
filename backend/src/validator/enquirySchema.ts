import * as yup from "yup";
import { EnquiryStatusEnum } from "../util/enum/enquiry.enum.js";
import { blankToUndefined, honeypot, isoDate, paginationQuery } from "./commonSchema.js";

const status = () => yup.string().oneOf(Object.values(EnquiryStatusEnum));

export const createEnquirySchema = yup.object({
  name: yup.string().trim().min(1, "Please add your name").max(120).required("Please add your name"),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please add a valid email")
    .required("Please add a valid email"),
  weddingDate: isoDate().transform(blankToUndefined).optional(),
  note: yup.string().trim().max(4000).default(""),
  website: honeypot(),
});

export const updateEnquirySchema = yup.object({
  status: status().optional(),
  internalNote: yup.string().max(4000).optional(),
});

export const listEnquiriesSchema = paginationQuery.shape({
  status: status().optional(),
  search: yup.string().trim().max(100).optional(),
});

export type CreateEnquiryInput = yup.InferType<typeof createEnquirySchema>;
export type UpdateEnquiryInput = yup.InferType<typeof updateEnquirySchema>;
export type ListEnquiriesQuery = yup.InferType<typeof listEnquiriesSchema>;
