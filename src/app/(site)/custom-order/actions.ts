"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { store } from "@/lib/store";
import { readImage } from "@/lib/images";
import type { CustomRequest } from "@/lib/types";

export type RequestFormState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{8,18}$/, "Please enter a valid WhatsApp number"),
  email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email").max(120)]),
  categoryId: z.string().max(60).optional(),
  description: z.string().trim().min(10, "Tell us a little more about your idea").max(2000),
  budget: z.string().trim().max(60).optional(),
  neededBy: z.string().trim().max(30).optional(),
});

// Basic per-IP rate limit: 5 requests per hour per server instance.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function submitCustomRequest(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  // Honeypot: real people never fill this hidden field.
  if (formData.get("company")) return { ok: true };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return { ok: false, error: "You've sent several requests already — please message us on WhatsApp instead." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    categoryId: (formData.get("categoryId") as string) || undefined,
    description: formData.get("description") ?? "",
    budget: (formData.get("budget") as string) || undefined,
    neededBy: (formData.get("neededBy") as string) || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, fieldErrors, error: "Please check the highlighted fields." };
  }

  const files = formData.getAll("images").filter((f) => f instanceof Blob && f.size > 0).slice(0, 3);
  const images: string[] = [];
  try {
    for (const f of files) {
      const { bytes, type } = await readImage(f);
      images.push(await store.uploadImage(bytes, type, "requests"));
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not upload your photo." };
  }

  const request: CustomRequest = {
    id: randomUUID(),
    ...parsed.data,
    email: parsed.data.email || undefined,
    images,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  await store.put("requests", request);
  return { ok: true };
}
