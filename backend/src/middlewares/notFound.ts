import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const notFound: RequestHandler = (req) => {
  throw new ApiError(404, `No route for ${req.method} ${req.originalUrl}`);
};
