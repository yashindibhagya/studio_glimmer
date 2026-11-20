/** Helpers for product videos hosted on Cloudinary (safe to use in the browser). */

export const MAX_VIDEOS = 3;
/** Cloudinary's free plan accepts videos up to 100 MB per file. */
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export function isCloudinaryVideo(url: string) {
  return url.startsWith("https://res.cloudinary.com/") && url.includes("/video/upload/");
}

/** A still frame from the start of the video, as a JPG — used as the poster and thumbnail. */
export function videoPoster(url: string, width = 900) {
  if (!isCloudinaryVideo(url)) return undefined;
  return url
    .replace("/video/upload/", `/video/upload/so_0,c_limit,w_${width},q_auto/`)
    .replace(/\.[a-z0-9]+$/i, ".jpg");
}
