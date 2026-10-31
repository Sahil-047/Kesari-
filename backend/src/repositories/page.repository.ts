import { PageModel } from "../models/index.js";
import type { Page, PageSlug } from "../schemas/page.schema.js";
import { BaseRepository } from "./base.repository.js";

class PageRepository extends BaseRepository<Page> {
  constructor() {
    super(PageModel);
  }

  findBySlug(slug: PageSlug) {
    return PageModel.findOne({ slug }).exec();
  }

  listAll() {
    return PageModel.find().select("slug draft published publishedAt updatedAt").exec();
  }

  /** Creates the page on first save. */
  saveDraft(slug: PageSlug, content: Record<string, unknown>, userId: string) {
    return PageModel.findOneAndUpdate(
      { slug },
      { $set: { draft: content, updatedBy: userId } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).exec();
  }
}

export const pageRepository = new PageRepository();
