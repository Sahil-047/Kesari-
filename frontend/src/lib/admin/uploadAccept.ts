/** Keep in sync with backend/src/util/helper/uploadTypes.ts */

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,.jpg,.jpeg,.png,.webp,.avif,.gif";
export const VIDEO_ACCEPT =
  "video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v";
export const MEDIA_ACCEPT = `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`;

export function looksLikeImage(file: File) {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXT.test(file.name) && (!file.type || file.type === "application/octet-stream");
}

export function looksLikeVideo(file: File) {
  if (
    file.type.startsWith("video/") ||
    file.type === "application/mp4" ||
    file.type === "video/quicktime"
  ) {
    return true;
  }
  return VIDEO_EXT.test(file.name) && (!file.type || file.type === "application/octet-stream");
}

export const VIDEO_HINT = "MP4, WebM or MOV · keep under the server upload limit";
