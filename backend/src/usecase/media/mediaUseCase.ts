import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getStorage } from "../../lib/aws/s3.js";
import MediaModel from "../../model/media.model.js";
import CustomError from "../../util/helper/customError.js";
import { paginate } from "../../util/helper/paginate.js";
import { searchFilter } from "../../util/helper/regex.js";
import { objectKey, publicUrlFor } from "../../util/helper/s3.js";
import type {
  ListMediaQuery,
  UpdateMediaInput,
  UploadMediaInput,
} from "../../validator/mediaSchema.js";

/** The S3-backed media library, and the /img proxy that serves it. */
class MediaUseCase {
  private async getOrThrow(id: string) {
    const media = await MediaModel.findById(id).exec();
    if (!media) throw CustomError.notFound("Media");
    return media;
  }

  async uploadMedia(
    file: Express.Multer.File | undefined,
    { alt, folder }: UploadMediaInput,
    userId: string,
  ) {
    if (!file) throw new CustomError('Attach a file in the "file" field');

    const { client, bucket } = getStorage();
    const key = objectKey(file.originalname, folder);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return MediaModel.create({
      key,
      url: publicUrlFor(key),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      alt,
      uploadedBy: userId,
    });
  }

  listMedia({ page, limit, type }: ListMediaQuery) {
    return paginate(MediaModel, {
      filter: type ? searchFilter(["mimeType"], `${type}/`) : {},
      page,
      limit,
    });
  }

  getMedia(id: string) {
    return this.getOrThrow(id);
  }

  async updateMedia(id: string, input: UpdateMediaInput) {
    await this.getOrThrow(id);
    return MediaModel.findByIdAndUpdate(id, input, { new: true, runValidators: true }).exec();
  }

  /** Removes the file from S3 first, then the library record. */
  async deleteMedia(id: string) {
    const media = await this.getOrThrow(id);
    const { client, bucket } = getStorage();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: media.key }));
    await MediaModel.findByIdAndDelete(id).exec();
  }

  /** Reads an object (or a byte range of it) for the /img proxy. */
  readObject(key: string, range?: string) {
    const { client, bucket } = getStorage();
    return client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key, ...(range ? { Range: range } : {}) }),
    );
  }
}

export default new MediaUseCase();
