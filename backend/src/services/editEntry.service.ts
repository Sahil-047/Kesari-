import { editEntryRepository } from "../repositories/editEntry.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreateEditEntryInput,
  ReorderEditInput,
  UpdateEditEntryInput,
} from "../validators/editEntry.validator.js";

async function getOrThrow(id: string) {
  const entry = await editEntryRepository.findByIdWithProduct(id);
  if (!entry) throw ApiError.notFound("Edit entry");
  return entry;
}

async function assertProductExists(productId: string) {
  if (!(await productRepository.exists({ _id: productId }))) {
    throw ApiError.badRequest("Product does not exist");
  }
}

export const editEntryService = {
  /** Public: published entries whose product is also published. */
  async listPublic() {
    const entries = await editEntryRepository.listOrdered(true);
    return entries.filter((entry) => {
      const product = entry.product as unknown as { status?: string } | null;
      return product?.status === "published";
    });
  },

  listAll() {
    return editEntryRepository.listOrdered(false);
  },

  get: getOrThrow,

  async create(input: CreateEditEntryInput) {
    await assertProductExists(input.product);
    const position = input.position ?? (await editEntryRepository.nextPosition());
    const entry = await editEntryRepository.create({ ...input, position });
    return getOrThrow(entry.id);
  },

  async update(id: string, input: UpdateEditEntryInput) {
    await getOrThrow(id);
    if (input.product) await assertProductExists(input.product);
    await editEntryRepository.updateById(id, input);
    return getOrThrow(id);
  },

  async remove(id: string) {
    await getOrThrow(id);
    await editEntryRepository.deleteById(id);
  },

  /** Takes the complete new order: every entry exactly once. */
  async reorder({ ids }: ReorderEditInput) {
    const unique = new Set(ids);
    const [total, matched] = await Promise.all([
      editEntryRepository.list({ limit: 1 }).then((r) => r.meta.total),
      editEntryRepository.countByIds([...unique]),
    ]);
    if (unique.size !== ids.length || matched !== ids.length || total !== ids.length) {
      throw ApiError.badRequest("Send every entry of The Edit exactly once");
    }
    await editEntryRepository.reorder(ids);
    return editEntryRepository.listOrdered(false);
  },
};
