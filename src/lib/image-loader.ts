"use client";

/**
 * Image loader for next/image.
 * Cloudinary photos are resized and converted by Cloudinary itself (fast, cached on its CDN).
 * Everything else (the logo, local dev uploads) is served as-is.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const marker = "/image/upload/";
  if (src.startsWith("https://res.cloudinary.com/") && src.includes(marker)) {
    const q = quality ? `q_${quality}` : "q_auto";
    return src.replace(marker, `${marker}f_auto,${q},c_limit,w_${width}/`);
  }
  // Not resized; the width parameter only keeps each srcset entry unique.
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
