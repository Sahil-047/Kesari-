import { S3Client } from "@aws-sdk/client-s3";
import { HttpStatusCode } from "axios";
import config from "../../config/index.js";
import CustomError from "../../util/helper/customError.js";

type Storage = { client: S3Client; bucket: string; region: string };

let storage: Storage | undefined;

/** The S3 client and bucket; a 503 when media storage is not configured yet. */
export function getStorage(): Storage {
  if (storage) return storage;
  const { region, bucket, accessKeyId, secretAccessKey } = config.awsConfig;
  if (!region || !bucket) {
    throw new CustomError(
      "Media storage is not configured (set AWS_REGION and AWS_S3_BUCKET)",
      HttpStatusCode.ServiceUnavailable,
    );
  }

  const credentials =
    accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined; // default AWS credential chain

  storage = { client: new S3Client({ region, credentials }), bucket, region };
  return storage;
}
