import { HttpStatusCode } from "axios";
import type { Response } from "express";
import type { IPaginated, IPaginationMeta } from "../interface/common.interface.js";

/** Every successful response has the shape { success: true, data, meta? }. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  { status = HttpStatusCode.Ok, meta }: { status?: number; meta?: IPaginationMeta } = {},
): void {
  res.status(status).json({ success: true, data, ...(meta && { meta }) });
}

export function sendPage<T>(res: Response, { items, meta }: IPaginated<T>): void {
  sendSuccess(res, items, { meta });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, { status: HttpStatusCode.Created });
}

export function sendNoContent(res: Response): void {
  res.status(HttpStatusCode.NoContent).end();
}
