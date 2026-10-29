import { z } from "zod";
import { ENQUIRY_STATUSES } from "../schemas/enquiry.schema.js";
import { paginationQuery } from "./common.validator.js";

export const createEnquiryBody = z.object({
  name: z.string().trim().min(1, "Please add your name").max(120),
  email: z.email("Please add a valid email").trim().toLowerCase(),
  weddingDate: z.iso.date().optional().or(z.literal("").transform(() => undefined)),
  note: z.string().trim().max(4000).default(""),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0, "Spam detected").optional(),
});

export const updateEnquiryBody = z
  .object({
    status: z.enum(ENQUIRY_STATUSES),
    internalNote: z.string().max(4000),
  })
  .partial();

export const listEnquiriesQuery = paginationQuery.extend({
  status: z.enum(ENQUIRY_STATUSES).optional(),
  search: z.string().trim().max(100).optional(),
});

export type CreateEnquiryInput = z.infer<typeof createEnquiryBody>;
export type UpdateEnquiryInput = z.infer<typeof updateEnquiryBody>;
export type ListEnquiriesQuery = z.infer<typeof listEnquiriesQuery>;
