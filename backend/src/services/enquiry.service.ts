import { enquiryRepository } from "../repositories/enquiry.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { searchFilter } from "../utils/regex.js";
import type {
  CreateEnquiryInput,
  ListEnquiriesQuery,
  UpdateEnquiryInput,
} from "../validators/enquiry.validator.js";

async function getOrThrow(id: string) {
  const enquiry = await enquiryRepository.findById(id);
  if (!enquiry) throw ApiError.notFound("Enquiry");
  return enquiry;
}

export const enquiryService = {
  /** From the public Atelier form. The honeypot field is dropped here. */
  create({ website: _honeypot, weddingDate, ...input }: CreateEnquiryInput) {
    return enquiryRepository.create({
      ...input,
      ...(weddingDate && { weddingDate: new Date(weddingDate) }),
      source: "atelier",
    });
  },

  list({ page, limit, status, search }: ListEnquiriesQuery) {
    return enquiryRepository.list({
      filter: {
        ...(status && { status }),
        ...(search && searchFilter(["name", "email", "note"], search)),
      },
      page,
      limit,
    });
  },

  get: getOrThrow,

  async update(id: string, input: UpdateEnquiryInput) {
    await getOrThrow(id);
    return enquiryRepository.updateById(id, input);
  },

  async remove(id: string) {
    await getOrThrow(id);
    await enquiryRepository.deleteById(id);
  },
};
