import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

const credentials =
  env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined; // fall back to the default AWS credential chain

export const s3 = new S3Client({ region: env.AWS_REGION, credentials });

/** Public URL for an object key, via the configured CDN or the bucket endpoint. */
export function publicUrlFor(key: string): string {
  const base =
    env.AWS_S3_PUBLIC_URL ??
    `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
  return `${base.replace(/\/$/, "")}/${key}`;
}
