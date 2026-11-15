import "server-only";
import type { Store } from "./types";
import { localStore } from "./local";
import { firebaseStore } from "./firebase";
import * as cloudinary from "./cloudinary";

const FIREBASE_VARS = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];
const CLOUDINARY_VARS = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missingFirebase = FIREBASE_VARS.filter((k) => !process.env[k]);
const missingCloudinary = CLOUDINARY_VARS.filter((k) => !process.env[k]);

/** Data (products, requests, settings…) is in Firestore when its keys are set; otherwise local files in .data/. */
export const usingFirebase = missingFirebase.length === 0;
/** Photos go to Cloudinary when its keys are set; otherwise local files in .data/uploads. */
export const usingCloudinary = missingCloudinary.length === 0;

if (process.env.VERCEL && (!usingFirebase || !usingCloudinary)) {
  throw new Error(
    `Firebase/Cloudinary not configured on Vercel. Missing: ${[...missingFirebase, ...missingCloudinary].join(", ")}`,
  );
}
for (const [name, vars, miss] of [
  ["Firebase", FIREBASE_VARS, missingFirebase],
  ["Cloudinary", CLOUDINARY_VARS, missingCloudinary],
] as const) {
  if (miss.length > 0 && miss.length < vars.length) {
    console.warn(`[store] ${name} is partially configured — not using it. Missing: ${miss.join(", ")}`);
  }
}

const data = usingFirebase ? firebaseStore : localStore;

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
