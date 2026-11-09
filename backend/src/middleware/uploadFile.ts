import { HttpStatusCode } from "axios";
import multer from "multer";
import config from "../config/index.js";
import CustomError from "../util/helper/customError.js";
import { isAllowedUpload } from "../util/helper/uploadTypes.js";

const maxMb = config.uploadConfig.maxUploadMb;

/** Keeps the upload in memory; the media use case streams it to S3. */
export const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedUpload(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    cb(
      new CustomError(
        `Unsupported file type (${file.mimetype || "unknown"}). Use JPG, PNG, WebP, AVIF, MP4, WebM or MOV (max ${maxMb} MB).`,
        HttpStatusCode.BadRequest,
      ),
    );
  },
});
