/**
 * Publishes empty content for every page slug that has never been published.
 * The storefront merges published blobs over PAGE_DEFAULTS, so {} is enough
 * to make public GET /pages/:slug succeed and the CMS editor start from defaults.
 *
 *   npm run seed-pages
 */
import { connectMongo, disconnectMongo } from "../lib/mongoose/index.js";
import logger from "../lib/winston/logger.js";
import PageModel from "../model/page.model.js";
import UserModel from "../model/user.model.js";
import PageUseCase from "../usecase/page/pageUseCase.js";
import { PageSlugEnum } from "../util/enum/page.enum.js";
import { RoleEnum } from "../util/enum/permission.enum.js";

async function main() {
  await connectMongo();
  try {
    const admin = await UserModel.findOne({ role: RoleEnum.ADMIN, isActive: true })
      .sort({ createdAt: 1 })
      .exec();
    if (!admin) {
      console.error("No active admin found. Run create-admin first.");
      process.exit(1);
    }

    let created = 0;
    let skipped = 0;

    for (const slug of Object.values(PageSlugEnum)) {
      const existing = await PageModel.findOne({ slug }).exec();
      if (existing?.published != null) {
        console.log(`skip  ${slug} (already published)`);
        skipped += 1;
        continue;
      }

      const draft = existing?.draft && Object.keys(existing.draft).length ? existing.draft : {};
      await PageUseCase.saveDraft(slug, draft, admin.id);
      await PageUseCase.publishPage(slug, admin.id);
      console.log(`publish  ${slug}`);
      created += 1;
    }

    logger.info("Page seed complete", { created, skipped, by: admin.email });
    console.log(`Done. Published ${created}, skipped ${skipped}.`);
  } finally {
    await disconnectMongo();
  }
}

main().catch((error) => {
  logger.error("Could not seed pages", { error: error instanceof Error ? error.message : error });
  process.exit(1);
});
