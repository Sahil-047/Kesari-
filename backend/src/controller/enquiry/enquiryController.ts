import type { RequestHandler } from "express";
import EnquiryUseCase from "../../usecase/enquiry/enquiryUseCase.js";
import { bodyOf, paramOf, queryOf } from "../../util/helper/request.js";
import { sendCreated, sendNoContent, sendPage, sendSuccess } from "../../util/helper/response.js";
import type {
  CreateEnquiryInput,
  ListEnquiriesQuery,
  UpdateEnquiryInput,
} from "../../validator/enquirySchema.js";

class EnquiryController {
  /** Public: the Atelier form. Returns only an acknowledgement. */
  submitEnquiry: RequestHandler = async (req, res, next) => {
    try {
      const enquiry = await EnquiryUseCase.submitEnquiry(bodyOf<CreateEnquiryInput>(req));
      sendCreated(res, { id: enquiry.id, receivedAt: enquiry.createdAt });
    } catch (error) {
      next(error);
    }
  };

  listEnquiries: RequestHandler = async (req, res, next) => {
    try {
      sendPage(res, await EnquiryUseCase.listEnquiries(queryOf<ListEnquiriesQuery>(req)));
    } catch (error) {
      next(error);
    }
  };

  getEnquiry: RequestHandler = async (req, res, next) => {
    try {
      sendSuccess(res, await EnquiryUseCase.getEnquiry(paramOf(req, "id")));
    } catch (error) {
      next(error);
    }
  };

  updateEnquiry: RequestHandler = async (req, res, next) => {
    try {
      const enquiry = await EnquiryUseCase.updateEnquiry(
        paramOf(req, "id"),
        bodyOf<UpdateEnquiryInput>(req),
      );
      sendSuccess(res, enquiry);
    } catch (error) {
      next(error);
    }
  };

  deleteEnquiry: RequestHandler = async (req, res, next) => {
    try {
      await EnquiryUseCase.deleteEnquiry(paramOf(req, "id"));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export default new EnquiryController();
