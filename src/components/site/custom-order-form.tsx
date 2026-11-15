"use client";

import { startTransition, useActionState, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { submitCustomRequest, type RequestFormState } from "@/app/(site)/custom-order/actions";
import { compressImage } from "@/lib/compress-image";
import { whatsappLink } from "@/lib/format";
import { Sparkle } from "./ornaments";
import { WhatsAppIcon } from "./whatsapp-icon";

type Preview = { blob: Blob; url: string };

export function CustomOrderForm({
  categories,
  whatsappNumber,
}: {
  categories: { id: string; name: string }[];
  whatsappNumber: string;
}) {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [imgError, setImgError] = useState("");
  const [compressing, setCompressing] = useState(false);

  const [state, action, pending] = useActionState<RequestFormState, FormData>(
    async (prev, formData) => {
      formData.delete("images-picker");
      previews.forEach((p, i) => formData.append("images", p.blob, `ref-${i}.webp`));
      const result = await submitCustomRequest(prev, formData);
      if (result.ok) {
        previews.forEach((p) => URL.revokeObjectURL(p.url));
        setPreviews([]);
      }
      return result;
    },
    { ok: false },
  );

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    setImgError("");
    setCompressing(true);
    try {
      const room = 3 - previews.length;
      const next: Preview[] = [];
      for (const f of Array.from(files).slice(0, room)) {
        const blob = await compressImage(f, 1400, 0.8);
        next.push({ blob, url: URL.createObjectURL(blob) });
      }
      setPreviews((p) => [...p, ...next]);
    } catch (e) {
      setImgError(e instanceof Error ? e.message : "Could not read that image.");
    } finally {
      setCompressing(false);
    }
  };

  if (state.ok) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="bg-rose-gold flex size-16 items-center justify-center rounded-full">
          <Sparkle className="size-7 text-white" />
        </div>
        <h2 className="font-display text-bronze mt-6 text-4xl">Thank you!</h2>
        <p className="text-muted mt-3 max-w-sm leading-relaxed">
          We&apos;ve received your idea and will message you on WhatsApp soon with a design and quote.
        </p>
        {whatsappNumber && (
          <a
            href={whatsappLink(whatsappNumber, "Hi Studio Glimmer! ✨ I just sent a custom order request on your website.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline mt-8"
          >
            <WhatsAppIcon className="size-4" /> Say hi on WhatsApp
          </a>
        )}
      </div>
    );
  }

  const err = state.fieldErrors ?? {};

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <h2 className="font-display text-bronze text-3xl">Tell us your idea</h2>

      {/* Honeypot (hidden from people, visible to bots) */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name *" error={err.name}>
          <input name="name" className="field" autoComplete="name" required maxLength={80} />
        </Field>
        <Field label="WhatsApp number *" error={err.phone}>
          <input name="phone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" required />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email (optional)" error={err.email}>
          <input name="email" className="field" type="email" autoComplete="email" />
        </Field>
        <Field label="Type of item">
          <select name="categoryId" className="field" defaultValue="">
            <option value="">Not sure yet</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Describe your idea *" error={err.description}>
        <textarea
          name="description"
          className="field min-h-36 resize-y"
          placeholder="e.g. A rose-gold tumbler with the name 'Amaya' in white crystals, for a birthday gift…"
          required
          maxLength={2000}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Budget (optional)">
          <input name="budget" className="field" placeholder="e.g. LKR 5,000" maxLength={60} />
        </Field>
        <Field label="Needed by (optional)">
          <input name="neededBy" className="field" type="date" />
        </Field>
      </div>

      <div>
        <span className="field-label">Reference photos (up to 3)</span>
        <div className="flex flex-wrap gap-3">
          {previews.map((p, i) => (
            <div key={p.url} className="relative size-24 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Reference ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(p.url);
                  setPreviews((all) => all.filter((x) => x !== p));
                }}
                className="bg-ink/70 absolute top-1 right-1 rounded-full p-1 text-white"
                aria-label={`Remove reference ${i + 1}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {previews.length < 3 && (
            <label className="border-rose/50 text-rose hover:bg-blush/50 flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-xs transition">
              {compressing ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" strokeWidth={1.4} />}
              Add photo
              <input
                name="images-picker"
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                className="sr-only"
                onChange={(e) => {
                  onPick(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
        {imgError && <p className="mt-2 text-sm text-red-700">{imgError}</p>}
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending || compressing}>
        {pending ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : "Send my idea"}
      </button>
      <p className="text-muted text-center text-xs">We usually reply within a day.</p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
    </label>
  );
}
