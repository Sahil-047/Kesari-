import { EnquiryModel } from "../models/index.js";
import type { Enquiry } from "../schemas/enquiry.schema.js";
import { BaseRepository } from "./base.repository.js";

class EnquiryRepository extends BaseRepository<Enquiry> {
  constructor() {
    super(EnquiryModel);
  }
}

export const enquiryRepository = new EnquiryRepository();
