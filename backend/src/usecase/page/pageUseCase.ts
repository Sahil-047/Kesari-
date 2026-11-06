import PageModel from "../../model/page.model.js";
import { PageSlugEnum } from "../../util/enum/page.enum.js";
import CustomError from "../../util/helper/customError.js";
import type { IPage } from "../../util/interface/house.interface.js";

function hasUnpublishedChanges(page: IPage): boolean {
  return JSON.stringify(page.draft ?? {}) !== JSON.stringify(page.published ?? null);
}

/** What the CMS needs to show one page in the editor. */
function toEditorView(page: IPage) {
  return {
    slug: page.slug,
    draft: page.draft ?? {},
    published: page.published ?? null,
    publishedAt: page.publishedAt ?? null,
    updatedAt: page.updatedAt,
    hasUnpublishedChanges: hasUnpublishedChanges(page),
  };
}

/** Website content: draft per page, publish copies the draft live. */
class PageUseCase {
  /** Every editable page, including ones never saved yet. */
  async listPages() {
    const saved = new Map(
      (await PageModel.find().select("slug draft published publishedAt updatedAt").exec()).map((p) => [
        p.slug,
        p,
      ]),
    );
    return Object.values(PageSlugEnum).map((slug) => {
      const page = saved.get(slug);
      return {
        slug,
        saved: Boolean(page),
        publishedAt: page?.publishedAt ?? null,
        updatedAt: page?.updatedAt ?? null,
        hasUnpublishedChanges: page ? hasUnpublishedChanges(page) : false,
      };
    });
  }

  /** Editor view; a page that was never saved comes back empty. */
  async getPageForEditor(slug: PageSlugEnum) {
    const page = await PageModel.findOne({ slug }).exec();
    if (!page) {
      return {
        slug,
        draft: {},
        published: null,
        publishedAt: null,
        updatedAt: null,
        hasUnpublishedChanges: false,
      };
    }
    return toEditorView(page);
  }

  /** Public: only the published version is ever served. */
  async getPublishedPage(slug: PageSlugEnum) {
    const page = await PageModel.findOne({ slug }).exec();
    if (!page?.published) throw CustomError.notFound("Page");
    return { slug, content: page.published, publishedAt: page.publishedAt };
  }

  /** Creates the page on first save. */
  async saveDraft(slug: PageSlugEnum, content: Record<string, unknown>, userId: string) {
    const page = await PageModel.findOneAndUpdate(
      { slug },
      { $set: { draft: content, updatedBy: userId } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).exec();
    return toEditorView(page);
  }

  async publishPage(slug: PageSlugEnum, userId: string) {
    const page = await PageModel.findOne({ slug }).exec();
    if (!page) throw new CustomError("Save the page before publishing it");
    page.published = page.draft;
    page.publishedAt = new Date();
    page.set("publishedBy", userId);
    page.markModified("published");
    await page.save();
    return toEditorView(page);
  }
}

export default new PageUseCase();
