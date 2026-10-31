import { S3Client } from "@aws-sdk/client-s3";
import { ApiError } from "../utils/ApiError.js";
import { env } from "./env.js";

type Storage = { client: S3Client; bucket: string; region: string };

let storage: Storage | undefined;

/** The S3 client and bucket; a 503 when media storage is not configured yet. */
export function getStorage(): Storage {
  if (storage) return storage;
  if (!env.AWS_REGION || !env.AWS_S3_BUCKET) {
    throw new ApiError(503, "Media storage is not configured (set AWS_REGION and AWS_S3_BUCKET)");
  }

  const credentials =
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
      : undefined; // fall back to the default AWS credential chain

  storage = {
    client: new S3Client({ region: env.AWS_REGION, credentials }),
    bucket: env.AWS_S3_BUCKET,
    region: env.AWS_REGION,
  };
  return storage;
}

/** Public URL for an object key, via the configured CDN or the bucket endpoint. */
export function publicUrlFor(key: string): string {
  const { bucket, region } = getStorage();
  const base = env.AWS_S3_PUBLIC_URL ?? `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${base.replace(/\/$/, "")}/${key}`;
}
