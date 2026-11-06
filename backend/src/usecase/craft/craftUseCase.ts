import CraftModel from "../../model/craft.model.js";
import { PublishStatusEnum } from "../../util/enum/common.enum.js";
import CustomError from "../../util/helper/customError.js";
import { paginate } from "../../util/helper/paginate.js";
import { resolveSlug } from "../../util/helper/slug.js";
import type {
  CreateCraftInput,
  ListCraftsQuery,
  UpdateCraftInput,
} from "../../validator/craftSchema.js";

type Visibility = { onlyPublished: boolean };

/** Craft story pages (/crafts/:slug). */
class CraftUseCase {
  private async getOrThrow(id: string) {
    const craft = await CraftModel.findById(id).exec();
    if (!craft) throw CustomError.notFound("Craft");
    return craft;
  }

  listCrafts(query: ListCraftsQuery, { onlyPublished }: Visibility) {
    const status = onlyPublished ? PublishStatusEnum.PUBLISHED : query.status;
    return paginate(CraftModel, {
      filter: status ? { status } : {},
      sort: { sortOrder: 1, createdAt: 1 },
      page: query.page,
      limit: query.limit,
    });
  }

  async getCraftBySlug(slug: string, { onlyPublished }: Visibility) {
    const craft = await CraftModel.findOne({
      slug,
      ...(onlyPublished && { status: PublishStatusEnum.PUBLISHED }),
    }).exec();
    if (!craft) throw CustomError.notFound("Craft");
    return craft;
  }

  getCraft(id: string) {
    return this.getOrThrow(id);
  }

  async createCraft(input: CreateCraftInput) {
    const slug = await resolveSlug(CraftModel, { explicit: input.slug, source: input.title });
    return CraftModel.create({ ...input, slug });
  }

  async updateCraft(id: string, input: UpdateCraftInput) {
    const craft = await this.getOrThrow(id);
    const slug =
      input.slug && input.slug !== craft.slug
        ? await resolveSlug(CraftModel, { explicit: input.slug, source: craft.title, excludeId: id })
        : undefined;
    return CraftModel.findByIdAndUpdate(
      id,
      { ...input, ...(slug && { slug }) },
      { new: true, runValidators: true },
    ).exec();
  }

  async deleteCraft(id: string) {
    await this.getOrThrow(id);
    await CraftModel.findByIdAndDelete(id).exec();
  }
}

export default new CraftUseCase();
