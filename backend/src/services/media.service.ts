import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { publicUrlFor, s3 } from "../config/s3.js";
import { mediaRepository } from "../repositories/media.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { searchFilter } from "../utils/regex.js";
import { slugify } from "../utils/slugify.js";
import type {
  ListMediaQuery,
  UpdateMediaInput,
  UploadMediaInput,
} from "../validators/media.validator.js";

/** media/2026/10/<uuid>-<readable-name>.<ext> */
function objectKey(originalName: string): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dot = originalName.lastIndexOf(".");
  const ext = dot > 0 ? originalName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const name = slugify(dot > 0 ? originalName.slice(0, dot) : originalName).slice(0, 60) || "file";
  return `media/${now.getUTCFullYear()}/${month}/${randomUUID()}-${name}${ext ? `.${ext}` : ""}`;
}

async function getOrThrow(id: string) {
  const media = await mediaRepository.findById(id);
  if (!media) throw ApiError.notFound("Media");
  return media;
}

export const mediaService = {
  async upload(file: Express.Multer.File | undefined, { alt }: UploadMediaInput, userId: string) {
    if (!file) throw ApiError.badRequest('Attach a file in the "file" field');

    const key = objectKey(file.originalname);
    await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return mediaRepository.create({
      key,
      url: publicUrlFor(key),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      alt,
      uploadedBy: userId,
    });
  },

  list({ page, limit, type }: ListMediaQuery) {
    return mediaRepository.list({
      filter: type ? searchFilter(["mimeType"], `${type}/`) : {},
      page,
      limit,
    });
  },

  get: getOrThrow,

  async update(id: string, input: UpdateMediaInput) {
    await getOrThrow(id);
    return mediaRepository.updateById(id, input);
  },

  /** Removes the file from S3 first, then the library record. */
  async remove(id: string) {
    const media = await getOrThrow(id);
    await s3.send(new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: media.key }));
    await mediaRepository.deleteById(id);
  },
};
