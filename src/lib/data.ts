import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { store } from "@/lib/store";
import {
  defaultCategories,
  defaultFaqs,
  defaultProducts,
  defaultReviews,
  defaultSettings,
} from "@/lib/seed";
import type { Category, Faq, GalleryItem, Product, Review, SiteSettings } from "@/lib/types";

/** Tag used for every public read; admin saves call updateTag(SITE_TAG). */
export const SITE_TAG = "site";

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

/** Fills an empty store with starter content on first run. */
export async function ensureSeeded() {
  if (await store.get("settings", "site")) return;
  await store.putMany("categories", defaultCategories);
  await store.putMany("products", defaultProducts);
  await store.putMany("faqs", defaultFaqs);
  await store.putMany("reviews", defaultReviews);
  await store.put("settings", defaultSettings);
}

// ---------- uncached reads (admin) ----------

export async function readSettings(): Promise<SiteSettings> {
  await ensureSeeded();
  const s = await store.get("settings", "site");
  // Merge so fields added in later versions always have a value.
  return { ...defaultSettings, ...s, policies: { ...defaultSettings.policies, ...s?.policies } };
}

// ---------- cached reads (public site) ----------

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(SITE_TAG);
  return readSettings();
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SITE_TAG);
  await ensureSeeded();
  return (await store.list("categories")).sort(bySort);
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SITE_TAG);
  await ensureSeeded();
  return (await store.list("products")).filter((p) => p.visible).sort(bySort);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(SITE_TAG);
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getGallery(): Promise<GalleryItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SITE_TAG);
  return (await store.list("gallery")).sort(bySort);
}

export async function getReviews(): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SITE_TAG);
  await ensureSeeded();
  return (await store.list("reviews")).filter((r) => r.visible).sort(bySort);
}

export async function getFaqs(): Promise<Faq[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SITE_TAG);
  await ensureSeeded();
  return (await store.list("faqs")).sort(bySort);
}
