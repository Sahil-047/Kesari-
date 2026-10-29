import type { RequestHandler } from "express";
import { enquiryService } from "../services/enquiry.service.js";
import { param, validatedBody, validatedQuery } from "../utils/request.js";
import { sendNoContent, sendSuccess } from "../utils/response.js";
import type {
  CreateEnquiryInput,
  ListEnquiriesQuery,
  UpdateEnquiryInput,
} from "../validators/enquiry.validator.js";

export const enquiryController = {
  /** Public: the Atelier form. Returns only an acknowledgement. */
  submit: (async (req, res) => {
    const enquiry = await enquiryService.create(validatedBody<CreateEnquiryInput>(req));
    sendSuccess(res, { id: enquiry.id, receivedAt: enquiry.createdAt }, { status: 201 });
  }) satisfies RequestHandler,

  list: (async (req, res) => {
    const { items, meta } = await enquiryService.list(validatedQuery<ListEnquiriesQuery>(req));
    sendSuccess(res, items, { meta });
  }) satisfies RequestHandler,

  get: (async (req, res) => {
    sendSuccess(res, await enquiryService.get(param(req, "id")));
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const enquiry = await enquiryService.update(
      param(req, "id"),
      validatedBody<UpdateEnquiryInput>(req),
    );
    sendSuccess(res, enquiry);
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await enquiryService.remove(param(req, "id"));
    sendNoContent(res);
  }) satisfies RequestHandler,
};
