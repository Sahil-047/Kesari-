/** MIME types accepted by the media library. */
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/**
 * Video MIME types. Includes QuickTime (.mov) — many phones export that —
 * plus empty-ish Windows reports for .mp4.
 */
export const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "application/mp4",
]);

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

/** True when the browser-reported type or the filename looks like an allowed image. */
export function isAllowedImage(mime: string, originalName: string) {
  if (ALLOWED_IMAGE_TYPES.has(mime)) return true;
  if (mime.startsWith("image/") && IMAGE_EXT.has(extOf(originalName))) return true;
  return IMAGE_EXT.has(extOf(originalName)) && (!mime || mime === "application/octet-stream");
}

/** True when the browser-reported type or the filename looks like an allowed video. */
export function isAllowedVideo(mime: string, originalName: string) {
  if (ALLOWED_VIDEO_TYPES.has(mime)) return true;
  if (mime.startsWith("video/") && VIDEO_EXT.has(extOf(originalName))) return true;
  return VIDEO_EXT.has(extOf(originalName)) && (!mime || mime === "application/octet-stream");
}

export function isAllowedUpload(mime: string, originalName: string) {
  return isAllowedImage(mime, originalName) || isAllowedVideo(mime, originalName);
}
