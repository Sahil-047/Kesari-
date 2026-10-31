import { pageRepository } from "../repositories/page.repository.js";
import { PAGE_SLUGS, type PageSlug } from "../schemas/page.schema.js";
import { ApiError } from "../utils/ApiError.js";

type PageDoc = NonNullable<Awaited<ReturnType<typeof pageRepository.findBySlug>>>;

function hasUnpublishedChanges(page: PageDoc): boolean {
  return JSON.stringify(page.draft ?? {}) !== JSON.stringify(page.published ?? null);
}

/** What the CMS needs to show one page in the editor. */
function toEditorView(page: PageDoc) {
  return {
    slug: page.slug,
    draft: page.draft ?? {},
    published: page.published ?? null,
    publishedAt: page.publishedAt ?? null,
    updatedAt: page.updatedAt,
    hasUnpublishedChanges: hasUnpublishedChanges(page),
  };
}

export const pageService = {
  /** Every editable page, including ones never saved yet. */
  async list() {
    const saved = new Map((await pageRepository.listAll()).map((p) => [p.slug, p]));
    return PAGE_SLUGS.map((slug) => {
      const page = saved.get(slug);
      return {
        slug,
        saved: Boolean(page),
        publishedAt: page?.publishedAt ?? null,
        updatedAt: page?.updatedAt ?? null,
        hasUnpublishedChanges: page ? hasUnpublishedChanges(page) : false,
      };
    });
  },

  /** Editor view; a page that was never saved comes back empty. */
  async get(slug: PageSlug) {
    const page = await pageRepository.findBySlug(slug);
    if (!page) {
      return { slug, draft: {}, published: null, publishedAt: null, updatedAt: null, hasUnpublishedChanges: false };
    }
    return toEditorView(page);
  },

  /** Public: only the published version is ever served. */
  async getPublished(slug: PageSlug) {
    const page = await pageRepository.findBySlug(slug);
    if (!page?.published) throw ApiError.notFound("Page");
    return { slug, content: page.published, publishedAt: page.publishedAt };
  },

  async saveDraft(slug: PageSlug, content: Record<string, unknown>, userId: string) {
    return toEditorView(await pageRepository.saveDraft(slug, content, userId));
  },

  async publish(slug: PageSlug, userId: string) {
    const page = await pageRepository.findBySlug(slug);
    if (!page) throw ApiError.badRequest("Save the page before publishing it");
    page.published = page.draft;
    page.publishedAt = new Date();
    page.set("publishedBy", userId);
    page.markModified("published");
    await page.save();
    return toEditorView(page);
  },
};
