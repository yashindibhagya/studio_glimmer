"use client";

function looksLikeHeic(file: File) {
  // Browsers often report an empty type for HEIC, so check the file name too.
  return /^image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

/** Decodes any supported photo, including iPhone HEIC/HEIF, into a bitmap. */
async function decode(file: File): Promise<ImageBitmap> {
  if (!looksLikeHeic(file)) {
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
    return createImageBitmap(file);
  }
  try {
    // Safari can read HEIC natively.
    return await createImageBitmap(file);
  } catch {
    // Other browsers can't, so convert it here (the converter only loads when needed).
    try {
      const { heicTo } = await import("heic-to/next");
      return await heicTo({ blob: file, type: "bitmap" });
    } catch {
      throw new Error("Could not read this HEIC photo. Please try another photo or a JPG.");
    }
  }
}

/**
 * Resizes an image in the browser and re-encodes it as WebP before upload,
 * so phone photos (often 5–10 MB, JPG/PNG/HEIC) become ~200–400 KB.
 */
export async function compressImage(file: File, maxSize = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await decode(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (blob && blob.type === "image/webp") return blob;
  // Safari versions without WebP encoding fall back to JPEG.
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!jpeg) throw new Error("Could not process image.");
  return jpeg;
}
