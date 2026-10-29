import type { Response } from "express";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

/** Every successful response has the shape { success: true, data, meta? }. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  { status = 200, meta }: { status?: number; meta?: PaginationMeta } = {},
): void {
  res.status(status).json({ success: true, data, ...(meta && { meta }) });
}

export function sendNoContent(res: Response): void {
  res.status(204).end();
}
