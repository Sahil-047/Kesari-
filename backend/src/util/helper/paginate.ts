import type { FilterQuery, Model, PopulateOptions, SortOrder } from "mongoose";
import config from "../../config/index.js";
import type { IPaginated, IPaginationMeta } from "../interface/common.interface.js";

export type PaginateOptions<T> = {
  filter?: FilterQuery<T>;
  sort?: Record<string, SortOrder>;
  page?: number;
  limit?: number;
  populate?: PopulateOptions | PopulateOptions[];
};

export function paginationMeta(page: number, limit: number, total: number): IPaginationMeta {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

/** One page of a collection plus its meta; list endpoints share this. */
export async function paginate<T>(
  model: Model<T>,
  {
    filter = {},
    sort = { createdAt: -1 },
    page = 1,
    limit = config.commonConfig.pageSize,
    populate,
  }: PaginateOptions<T> = {},
): Promise<IPaginated<T>> {
  let query = model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
  if (populate) query = query.populate(populate);

  const [items, total] = await Promise.all([query.exec(), model.countDocuments(filter).exec()]);
  return { items: items as T[], meta: paginationMeta(page, limit, total) };
}
