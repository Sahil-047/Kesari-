import type { PaginationMeta } from "./response.js";

export type Paginated<T> = { items: T[]; meta: PaginationMeta };

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}
