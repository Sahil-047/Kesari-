import { HttpStatusCode } from "axios";
import multer from "multer";
import config from "../config/index.js";
import CustomError from "../util/helper/customError.js";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
]);

/** Keeps the upload in memory; the media use case streams it to S3. */
export const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.uploadConfig.maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new CustomError(`Unsupported file type: ${file.mimetype}`, HttpStatusCode.BadRequest));
  },
});
