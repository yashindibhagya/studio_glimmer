"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { checkCredentials, endSession, isLockedOut, requireAdmin, startSession } from "@/lib/auth";
import { SITE_TAG, readSettings } from "@/lib/data";
import { readImage } from "@/lib/images";
import { slugify } from "@/lib/format";
import { store, usingCloudinary } from "@/lib/store";
import { isOwnVideoUrl, signVideoUpload } from "@/lib/store/cloudinary";
import { MAX_VIDEOS } from "@/lib/video";
import type { Category, CustomRequest, Faq, GalleryItem, Product, Review, SiteSettings } from "@/lib/types";

export type ActionResult = { ok: boolean; error?: string; id?: string };

const fail = (e: unknown): ActionResult => ({
  ok: false,
  error: e instanceof z.ZodError ? e.issues[0]?.message ?? "Invalid input" : e instanceof Error ? e.message : "Something went wrong",
});

function refreshSite() {
  updateTag(SITE_TAG);
}

async function removeImages(urls: string[]) {
  await Promise.all(urls.map((u) => store.deleteImage(u).catch(() => undefined)));
}

// ---------------------------------------------------------------- auth

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const h = await headers();
  const key = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isLockedOut(key)) return { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!(await checkCredentials(email, password, key))) {
    return { ok: false, error: "Incorrect email or password." };
  }
  await startSession(email.trim().toLowerCase());
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- images

export async function uploadImageAction(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdmin();
  try {
    const folder = String(formData.get("folder") ?? "misc").replace(/[^a-z]/g, "") || "misc";
    const { bytes, type } = await readImage(formData.get("file"));
    return { ok: true, url: await store.uploadImage(bytes, type, folder) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export type VideoUploadTicket = ReturnType<typeof signVideoUpload>;

/** Gives the admin's browser a short-lived signature to upload one video straight to Cloudinary. */
export async function videoUploadTicket(): Promise<{ ok: boolean; ticket?: VideoUploadTicket; error?: string }> {
  await requireAdmin();
  if (!usingCloudinary) return { ok: false, error: "Video uploads need Cloudinary to be set up." };
  try {
    return { ok: true, ticket: signVideoUpload("products") };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not start the upload" };
  }
}

// ---------------------------------------------------------------- products

const imageUrl = z.string().min(1).max(500).refine((u) => u.startsWith("/uploads/") || u.startsWith("https://"), "Invalid image");

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Product name is required").max(120),
  slug: z.string().trim().max(120).optional(),
  categoryId: z.string().min(1, "Choose a category"),
  price: z.coerce.number().int("Price must be a whole number").min(0).max(10_000_000),
  compareAtPrice: z.coerce.number().int().min(0).max(10_000_000).nullable().optional(),
  description: z.string().trim().max(4000),
  images: z.array(imageUrl).max(8, "Up to 8 photos per product"),
  videos: z
    .array(z.string().max(500).refine(isOwnVideoUrl, "Invalid video"))
    .max(MAX_VIDEOS, `Up to ${MAX_VIDEOS} videos per product`)
    .default([]),
  options: z
    .array(z.object({ name: z.string().trim().min(1).max(40), values: z.array(z.string().trim().min(1).max(60)).min(1).max(30) }))
    .max(5),
  personalizable: z.boolean(),
  personalizationLabel: z.string().trim().max(60).optional(),
  featured: z.boolean(),
  isNew: z.boolean(),
  inStock: z.boolean(),
  visible: z.boolean(),
});
export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = productSchema.parse(input);
    const all = await store.list("products");
    const existing = data.id ? all.find((p) => p.id === data.id) : undefined;
    if (data.id && !existing) return { ok: false, error: "Product no longer exists." };

    let slug = slugify(data.slug || data.name) || randomUUID().slice(0, 8);
    const taken = new Set(all.filter((p) => p.id !== data.id).map((p) => p.slug));
    for (let i = 2; taken.has(slug); i++) slug = `${slugify(data.slug || data.name)}-${i}`;

    const product: Product = {
      ...existing,
      ...data,
      id: existing?.id ?? randomUUID(),
      slug,
      compareAtPrice: data.compareAtPrice || null,
      sortOrder: existing?.sortOrder ?? Math.max(0, ...all.map((p) => p.sortOrder)) + 1,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      sample: false,
    };
    await store.put("products", product);
    if (existing) {
      const kept = new Set([...product.images, ...(product.videos ?? [])]);
      await removeImages([...existing.images, ...(existing.videos ?? [])].filter((u) => !kept.has(u)));
    }
    refreshSite();
    return { ok: true, id: product.id };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const p = await store.get("products", id);
  if (!p) return { ok: true };
  await store.remove("products", id);
  await removeImages([...p.images, ...(p.videos ?? [])]);
  refreshSite();
  return { ok: true };
}

export async function toggleProductFlag(id: string, flag: "visible" | "featured" | "inStock" | "isNew"): Promise<ActionResult> {
  await requireAdmin();
  const p = await store.get("products", id);
  if (!p) return { ok: false, error: "Not found" };
  await store.put("products", { ...p, [flag]: !p[flag] });
  refreshSite();
  return { ok: true };
}

/** Moves an item up/down within its collection's sort order. */
export async function moveItem(
  collection: "products" | "categories" | "faqs" | "gallery" | "reviews",
  id: string,
  dir: -1 | 1,
): Promise<ActionResult> {
  await requireAdmin();
  const items = (await store.list(collection)).sort((a, b) => a.sortOrder - b.sortOrder);
  const i = items.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= items.length) return { ok: true };
  [items[i], items[j]] = [items[j], items[i]];
  const renumbered = items.map((x, k) => ({ ...x, sortOrder: k + 1 }));
  await store.putMany(collection, renumbered as never);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------- categories

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Category name is required").max(60),
  tagline: z.string().trim().max(120),
  image: imageUrl.nullable().optional(),
});

export async function saveCategory(input: z.input<typeof categorySchema>): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = categorySchema.parse(input);
    const all = await store.list("categories");
    const existing = data.id ? all.find((c) => c.id === data.id) : undefined;
    let slug = existing?.slug ?? slugify(data.name);
    const taken = new Set(all.filter((c) => c.id !== data.id).map((c) => c.slug));
    for (let i = 2; taken.has(slug); i++) slug = `${slugify(data.name)}-${i}`;
    const category: Category = {
      id: existing?.id ?? randomUUID(),
      slug,
      name: data.name,
      tagline: data.tagline,
      image: data.image ?? null,
      sortOrder: existing?.sortOrder ?? Math.max(0, ...all.map((c) => c.sortOrder)) + 1,
    };
    await store.put("categories", category);
    if (existing?.image && existing.image !== category.image) await removeImages([existing.image]);
    refreshSite();
    return { ok: true, id: category.id };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const inUse = (await store.list("products")).filter((p) => p.categoryId === id).length;
  if (inUse) return { ok: false, error: `Move or delete the ${inUse} product(s) in this category first.` };
  const c = await store.get("categories", id);
  await store.remove("categories", id);
  if (c?.image) await removeImages([c.image]);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------- gallery

export async function addGalleryItems(images: string[]): Promise<ActionResult> {
  await requireAdmin();
  try {
    const urls = z.array(imageUrl).max(20).parse(images);
    const all = await store.list("gallery");
    // New photos go first.
    const shifted = all.map((g) => ({ ...g, sortOrder: g.sortOrder + urls.length }));
    const now = new Date().toISOString();
    const added: GalleryItem[] = urls.map((image, i) => ({ id: randomUUID(), image, caption: "", sortOrder: i + 1, createdAt: now }));
    await store.putMany("gallery", [...shifted, ...added]);
    refreshSite();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateGalleryCaption(id: string, caption: string): Promise<ActionResult> {
  await requireAdmin();
  const g = await store.get("gallery", id);
  if (!g) return { ok: false, error: "Not found" };
  await store.put("gallery", { ...g, caption: caption.trim().slice(0, 140) });
  refreshSite();
  return { ok: true };
}

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  await requireAdmin();
  const g = await store.get("gallery", id);
  await store.remove("gallery", id);
  if (g) await removeImages([g.image]);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------- reviews

const reviewSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Customer name is required").max(60),
  text: z.string().trim().min(3, "Review text is required").max(600),
  rating: z.coerce.number().int().min(1).max(5),
  product: z.string().trim().max(120).optional(),
  visible: z.boolean(),
});

export async function saveReview(input: z.input<typeof reviewSchema>): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = reviewSchema.parse(input);
    const all = await store.list("reviews");
    const existing = data.id ? all.find((r) => r.id === data.id) : undefined;
    const review: Review = {
      ...data,
      id: existing?.id ?? randomUUID(),
      sortOrder: existing?.sortOrder ?? Math.max(0, ...all.map((r) => r.sortOrder)) + 1,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      sample: false,
    };
    await store.put("reviews", review);
    refreshSite();
    return { ok: true, id: review.id };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireAdmin();
  await store.remove("reviews", id);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------- FAQs

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(3, "Question is required").max(200),
  answer: z.string().trim().min(3, "Answer is required").max(2000),
});

export async function saveFaq(input: z.input<typeof faqSchema>): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = faqSchema.parse(input);
    const all = await store.list("faqs");
    const existing = data.id ? all.find((f) => f.id === data.id) : undefined;
    const faq: Faq = {
      ...data,
      id: existing?.id ?? randomUUID(),
      sortOrder: existing?.sortOrder ?? Math.max(0, ...all.map((f) => f.sortOrder)) + 1,
    };
    await store.put("faqs", faq);
    refreshSite();
    return { ok: true, id: faq.id };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  await requireAdmin();
  await store.remove("faqs", id);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------- custom requests

const statusSchema = z.enum(["new", "in_progress", "quoted", "completed", "archived"]);

export async function updateRequest(
  id: string,
  patch: { status?: CustomRequest["status"]; adminNotes?: string },
): Promise<ActionResult> {
  await requireAdmin();
  try {
    const r = await store.get("requests", id);
    if (!r) return { ok: false, error: "Request not found" };
    const next: CustomRequest = {
      ...r,
      ...(patch.status ? { status: statusSchema.parse(patch.status) } : {}),
      ...(patch.adminNotes !== undefined ? { adminNotes: patch.adminNotes.slice(0, 2000) } : {}),
    };
    await store.put("requests", next);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteRequest(id: string): Promise<ActionResult> {
  await requireAdmin();
  const r = await store.get("requests", id);
  await store.remove("requests", id);
  if (r) await removeImages(r.images);
  return { ok: true };
}

// ---------------------------------------------------------------- settings

const optionalUrl = z.union([z.literal(""), z.string().trim().url("Enter a full link starting with https://").max(300)]);

const settingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .transform((s) => s.replace(/\D/g, ""))
    .refine((s) => s === "" || (s.length >= 10 && s.length <= 15), "WhatsApp number should include the country code, e.g. 94771234567"),
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  facebookUrl: optionalUrl,
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]),
  location: z.string().trim().max(120),
  promoEnabled: z.boolean(),
  promoText: z.string().trim().max(160),
  heroEyebrow: z.string().trim().max(60),
  heroScript: z.string().trim().max(30),
  heroTitle: z.string().trim().max(60),
  heroSubtitle: z.string().trim().max(300),
  heroImage: imageUrl.nullable().optional(),
  aboutTitle: z.string().trim().max(80),
  aboutText: z.string().trim().max(5000),
  aboutImage: imageUrl.nullable().optional(),
  stats: z.array(z.object({ value: z.string().trim().max(20), label: z.string().trim().max(30) })).length(3),
  policies: z.object({
    shipping: z.string().max(10000),
    returns: z.string().max(10000),
    privacy: z.string().max(10000),
    terms: z.string().max(10000),
  }),
});
export type SettingsInput = z.input<typeof settingsSchema>;

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = settingsSchema.parse(input);
    const current = await readSettings();
    const next: SiteSettings = { ...current, ...data, id: "site", heroImage: data.heroImage ?? null, aboutImage: data.aboutImage ?? null };
    await store.put("settings", next);
    const dropped = [current.heroImage, current.aboutImage].filter(
      (u): u is string => Boolean(u) && u !== next.heroImage && u !== next.aboutImage,
    );
    await removeImages(dropped);
    refreshSite();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
