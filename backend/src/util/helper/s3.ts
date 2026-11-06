import { randomUUID } from "node:crypto";
import config from "../../config/index.js";
import { getStorage } from "../../lib/aws/s3.js";
import { slugify } from "./slug.js";

function fileNameParts(originalName: string) {
  const dot = originalName.lastIndexOf(".");
  const ext = dot > 0 ? originalName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const name = slugify(dot > 0 ? originalName.slice(0, dot) : originalName).slice(0, 60) || "file";
  return { name, ext };
}

/**
 * Keys always live under `media/` so they match the kesari-app IAM PutObject
 * prefix. An optional folder becomes media/products/soft-ivory/<file>.
 */
export function objectKey(originalName: string, folder?: string): string {
  const { name, ext } = fileNameParts(originalName);
  const leaf = `${randomUUID()}-${name}${ext ? `.${ext}` : ""}`;
  if (folder) {
    const clean = folder
      .toLowerCase()
      .replace(/[^a-z0-9/_-]/g, "")
      .replace(/\/+/g, "/")
      .replace(/^\/|\/$/g, "")
      .replace(/^media\//, "");
    if (clean) return `media/${clean}/${leaf}`;
  }
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `media/${now.getUTCFullYear()}/${month}/${leaf}`;
}

/** Public URL for an object key, via the configured proxy/CDN or the bucket endpoint. */
export function publicUrlFor(key: string): string {
  const { bucket, region } = getStorage();
  const base = config.awsConfig.publicUrl ?? `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${base.replace(/\/$/, "")}/${key}`;
}

/** Turns the wildcard part of /img/*key into a safe object key, or null. */
export function objectKeyFromParams(raw: unknown): string | null {
  const joined = Array.isArray(raw) ? raw.join("/") : String(raw ?? "");
  const key = joined.replace(/^\/+/, "").trim();
  if (!key || key.includes("..") || key.includes("\\") || key.includes("\0")) return null;
  return key;
}
