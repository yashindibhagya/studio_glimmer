import "server-only";
import type { Store } from "./types";
import { localStore } from "./local";
import * as cloudinary from "./cloudinary";
import { cloudinaryData } from "./cloudinary-data";

const CLOUDINARY_VARS = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missing = CLOUDINARY_VARS.filter((k) => !process.env[k]);

/**
 * With the Cloudinary keys set, everything lives on Cloudinary: photos as images,
 * and shop data (products, requests, settings…) as private JSON files.
 * Without them, everything is kept in local files in .data/ (development only).
 */
export const usingCloudinary = missing.length === 0;

if (process.env.VERCEL && !usingCloudinary) {
  throw new Error(`Cloudinary is not configured on Vercel. Missing: ${missing.join(", ")}`);
}
if (missing.length > 0 && missing.length < CLOUDINARY_VARS.length) {
  console.warn(`[store] Cloudinary is partially configured — not using it. Missing: ${missing.join(", ")}`);
}

const data = usingCloudinary ? cloudinaryData : localStore;

export const store: Store = {
  list: data.list,
  get: data.get,
  put: data.put,
  putMany: data.putMany,
  remove: data.remove,
  uploadImage: usingCloudinary ? cloudinary.uploadImage : localStore.uploadImage,
  // Each store ignores URLs it doesn't own, so old local photos and Cloudinary photos both clean up.
  async deleteImage(url) {
    if (url.startsWith("/uploads/")) return localStore.deleteImage(url);
    if (usingCloudinary) return cloudinary.deleteImage(url);
  },
};
