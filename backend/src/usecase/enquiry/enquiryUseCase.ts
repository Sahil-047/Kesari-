import EnquiryModel from "../../model/enquiry.model.js";
import CustomError from "../../util/helper/customError.js";
import { paginate } from "../../util/helper/paginate.js";
import { searchFilter } from "../../util/helper/regex.js";
import type {
  CreateEnquiryInput,
  ListEnquiriesQuery,
  UpdateEnquiryInput,
} from "../../validator/enquirySchema.js";

/** Notes written to the house from the Atelier page. */
class EnquiryUseCase {
  private async getOrThrow(id: string) {
    const enquiry = await EnquiryModel.findById(id).exec();
    if (!enquiry) throw CustomError.notFound("Enquiry");
    return enquiry;
  }

  /** From the public Atelier form. The honeypot field is dropped here. */
  submitEnquiry({ website: _honeypot, weddingDate, ...input }: CreateEnquiryInput) {
    return EnquiryModel.create({
      ...input,
      ...(weddingDate && { weddingDate: new Date(weddingDate) }),
      source: "atelier",
    });
  }

  listEnquiries({ page, limit, status, search }: ListEnquiriesQuery) {
    return paginate(EnquiryModel, {
      filter: {
        ...(status && { status }),
        ...(search && searchFilter(["name", "email", "note"], search)),
      },
      page,
      limit,
    });
  }

  getEnquiry(id: string) {
    return this.getOrThrow(id);
  }

  async updateEnquiry(id: string, input: UpdateEnquiryInput) {
    await this.getOrThrow(id);
    return EnquiryModel.findByIdAndUpdate(id, input, { new: true, runValidators: true }).exec();
  }

  async deleteEnquiry(id: string) {
    await this.getOrThrow(id);
    await EnquiryModel.findByIdAndDelete(id).exec();
  }
}

export default new EnquiryUseCase();
