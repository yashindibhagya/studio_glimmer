import "server-only";
import { createHash } from "node:crypto";

/**
 * Image storage on Cloudinary (free plan, no card needed). Shop data is in cloudinary-data.ts.
 * Uses Cloudinary's signed REST API directly, so no SDK is required.
 */
const ROOT_FOLDER = "studio-glimmer";

export function cloudinaryConfig() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) throw new Error("Cloudinary is not configured.");
  return { cloud, key, secret };
}

/** Cloudinary signature: SHA-1 of the sorted params joined as a query string, plus the API secret. */
export function signParams(params: Record<string, string | number>, secret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

/**
 * "https://res.cloudinary.com/x/image/upload/v123/studio-glimmer/products/abc.webp"
 *   → { type: "image", publicId: "studio-glimmer/products/abc" }
 */
export function publicIdFromUrl(url: string) {
  const m = url.match(/^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/(?:v\d+\/)?(.+)$/);
  if (!m) return null;
  const [, type, rest] = m;
  if (!rest.startsWith(`${ROOT_FOLDER}/`)) return null; // never delete files we didn't upload
  return { type: type as "image" | "video", publicId: rest.replace(/\.[a-z0-9]+$/i, "") };
}

/**
 * Signs a direct browser → Cloudinary video upload. Videos are too big to pass
 * through our own server, so the admin's browser sends them straight to Cloudinary.
 */
export function signVideoUpload(folder: string) {
  const { cloud, key, secret } = cloudinaryConfig();
  const params = { folder: `${ROOT_FOLDER}/${folder}`, timestamp: Math.floor(Date.now() / 1000) };
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloud}/video/upload`,
    apiKey: key,
    folder: params.folder,
    timestamp: params.timestamp,
    signature: signParams(params, secret),
  };
}

/** True only for videos uploaded to this shop's Cloudinary folder. */
export function isOwnVideoUrl(url: string) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const id = publicIdFromUrl(url);
  return !!cloud && url.startsWith(`https://res.cloudinary.com/${cloud}/video/upload/`) && id?.type === "video";
}

export async function uploadImage(bytes: Uint8Array, contentType: string, folder: string) {
  const { cloud, key, secret } = cloudinaryConfig();
  const params = { folder: `${ROOT_FOLDER}/${folder}`, timestamp: Math.floor(Date.now() / 1000) };
  const form = new FormData();
  form.append("file", new Blob([bytes as BlobPart], { type: contentType }));
  form.append("api_key", key);
  form.append("folder", params.folder);
  form.append("timestamp", String(params.timestamp));
  form.append("signature", signParams(params, secret));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  const json = (await res.json()) as { secure_url?: string; error?: { message: string } };
  if (!res.ok || !json.secure_url) throw new Error(`Image upload failed: ${json.error?.message ?? res.status}`);
  return json.secure_url;
}

/** Deletes a photo or video we uploaded (works out which from the URL). */
export async function deleteImage(url: string) {
  const id = publicIdFromUrl(url);
  if (!id) return;
  const { publicId, type } = id;
  const { cloud, key, secret } = cloudinaryConfig();
  const params = { public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", key);
  form.append("timestamp", String(params.timestamp));
  form.append("signature", signParams(params, secret));
  await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${type}/destroy`, { method: "POST", body: form });
}
