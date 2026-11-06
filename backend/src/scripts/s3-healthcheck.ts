/**
 * One-off probe: credentials, put, SDK get, public HTTP get, cleanup.
 *   npx tsx src/scripts/s3-healthcheck.ts
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
const publicBase = process.env.AWS_S3_PUBLIC_URL;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

function failDetail(e: unknown) {
  const err = e as {
    name?: string;
    message?: string;
    Code?: string;
    code?: string;
    $metadata?: { httpStatusCode?: number; requestId?: string };
  };
  return [
    `${err.name ?? "Error"}: ${err.message ?? String(e)}`,
    `code=${err.Code ?? err.code ?? "?"}`,
    `http=${err.$metadata?.httpStatusCode ?? "?"}`,
    `requestId=${err.$metadata?.requestId ?? "?"}`,
  ].join(" | ");
}

if (!region || !bucket || !accessKeyId || !secretAccessKey) {
  console.error("Missing AWS_REGION / AWS_S3_BUCKET / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY");
  process.exit(1);
}

console.log(`region=${region}`);
console.log(`bucket=${bucket}`);
console.log(`publicBase=${publicBase || "(unset)"}`);
console.log(`accessKeyId=${accessKeyId.slice(0, 4)}… (len=${accessKeyId.length})`);

const client = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

function publicUrlFor(key: string) {
  const base = publicBase ?? `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${base.replace(/\/$/, "")}/${key}`;
}

try {
  const listed = await client.send(new ListBucketsCommand({}));
  const names = (listed.Buckets ?? []).map((b) => b.Name).filter(Boolean);
  console.log(`ListBuckets: OK (${names.length} buckets)`);
  console.log(`  contains target? ${names.includes(bucket) ? "yes" : "NO — check AWS_S3_BUCKET"}`);
  if (!names.includes(bucket) && names.length) {
    console.log(`  available: ${names.slice(0, 10).join(", ")}`);
  }
} catch (e) {
  console.log(`ListBuckets: FAIL — ${failDetail(e)}`);
}

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log("HeadBucket: OK");
} catch (e) {
  console.log(`HeadBucket: FAIL — ${failDetail(e)}`);
}

const key = `media/healthcheck/${randomUUID()}-probe.png`;
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

try {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: png,
      ContentType: "image/png",
      CacheControl: "public, max-age=60",
    }),
  );
  console.log(`PutObject: OK  key=${key}`);
} catch (e) {
  console.log(`PutObject: FAIL — ${failDetail(e)}`);
  process.exit(1);
}

try {
  const got = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const bytes = await got.Body?.transformToByteArray();
  console.log(`GetObject (SDK): OK  bytes=${bytes?.length ?? 0} type=${got.ContentType}`);
} catch (e) {
  console.log(`GetObject (SDK): FAIL — ${failDetail(e)}`);
}

const urlConfigured = publicUrlFor(key);
const urlRoot = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
console.log(`Public URL (configured): ${urlConfigured}`);
console.log(`Public URL (bucket root): ${urlRoot}`);

for (const [label, url] of [
  ["configured", urlConfigured],
  ["bucket-root", urlRoot],
] as const) {
  try {
    const res = await fetch(url);
    console.log(
      `HTTP GET ${label}: ${res.status} ${res.statusText} content-type=${res.headers.get("content-type") ?? ""}`,
    );
  } catch (e) {
    console.log(`HTTP GET ${label}: FAIL — ${(e as Error).message}`);
  }
}

try {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  console.log("DeleteObject cleanup: OK");
} catch (e) {
  console.log(`DeleteObject cleanup: FAIL — ${failDetail(e)}`);
}
