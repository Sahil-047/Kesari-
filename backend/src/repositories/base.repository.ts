import type {
  AnyKeys,
  FilterQuery,
  Model,
  PopulateOptions,
  SortOrder,
  UpdateQuery,
} from "mongoose";
import { paginationMeta, type Paginated } from "../utils/pagination.js";

export type ListOptions<T> = {
  filter?: FilterQuery<T>;
  sort?: Record<string, SortOrder>;
  page?: number;
  limit?: number;
  populate?: PopulateOptions | PopulateOptions[];
};

/**
 * Data access shared by every resource. Repositories are the only layer that
 * talks to Mongoose; services work with what they return.
 */
export class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  findOne(filter: FilterQuery<T>) {
    return this.model.findOne(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    return (await this.model.exists(filter)) !== null;
  }

  async list({
    filter = {},
    sort = { createdAt: -1 },
    page = 1,
    limit = 20,
    populate,
  }: ListOptions<T> = {}): Promise<Paginated<T>> {
    let query = this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    if (populate) query = query.populate(populate);

    const [items, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items: items as T[], meta: paginationMeta(page, limit, total) };
  }

  /** Plain input (arrays, ids as strings); Mongoose casts it to the schema. */
  create(data: AnyKeys<T>) {
    return this.model.create(data);
  }

  updateById(id: string, update: UpdateQuery<T>) {
    return this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .exec();
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}
