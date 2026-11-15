"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import type { PolicyKey, SiteSettings } from "@/lib/types";
import { saveSettings } from "@/app/admin/actions";
import { POLICY_TITLES } from "@/lib/policies";
import { ImageUploader } from "./image-uploader";
import { Card, Toggle } from "./ui";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [s, setS] = useState(settings);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => {
    setSaved(false);
    setDirty(true);
    setS((prev) => ({ ...prev, [k]: v }));
  };

  const save = (next: SiteSettings) => {
    setError("");
    start(async () => {
      const { id: _id, ...input } = next;
      void _id;
      const res = await saveSettings(input);
      if (!res.ok) setError(res.error ?? "Could not save");
      else {
        setSaved(true);
        setDirty(false);
        router.refresh();
      }
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save(s);
  };

  /** Photos save straight away, so an uploaded photo is never lost by forgetting to press Save. */
  const setPhoto = (k: "heroImage" | "aboutImage", url: string | null) => {
    const next = { ...s, [k]: url };
    setSaved(false);
    setS(next);
    save(next);
  };

  const text = (k: keyof SiteSettings, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field" value={String(s[k] ?? "")} onChange={(e) => set(k, e.target.value as never)} {...props} />
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      <Card className="space-y-5">
        <h2 className="font-display text-bronze text-2xl">Contact & ordering</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {text("whatsappNumber", "WhatsApp number (with country code)", { placeholder: "94771234567", inputMode: "tel" })}
          {text("email", "Email (optional)", { type: "email" })}
          {text("instagramUrl", "Instagram link", { placeholder: "https://www.instagram.com/…" })}
          {text("tiktokUrl", "TikTok link (optional)")}
          {text("facebookUrl", "Facebook link (optional)")}
          {text("location", "Location line")}
        </div>
        <p className="text-muted text-xs">
          Orders from the website are sent to this WhatsApp number. Until it&apos;s set, customers cannot place orders: the order button is replaced by a short notice.
        </p>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-bronze text-2xl">Announcement bar</h2>
        <Toggle checked={s.promoEnabled} onChange={(v) => set("promoEnabled", v)} label="Show the announcement bar at the top of the website" />
        {text("promoText", "Announcement text", { maxLength: 160 })}
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-bronze text-2xl">Homepage hero</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {text("heroEyebrow", "Small top text", { maxLength: 60 })}
          {text("heroScript", "Script word", { maxLength: 30 })}
          {text("heroTitle", "Main headline", { maxLength: 60 })}
        </div>
        <label className="block">
          <span className="field-label">Subtitle</span>
          <textarea className="field min-h-20" value={s.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} maxLength={300} />
        </label>
        <div className="max-w-xs">
          <ImageUploader
            value={s.heroImage ? [s.heroImage] : []}
            onChange={(v) => setPhoto("heroImage", v[0] ?? null)}
            max={1}
            folder="site"
            label="Hero photo"
            hint="A tall (portrait) photo works best. Leave empty to show your logo. Photos save automatically."
          />
        </div>
        <div>
          <span className="field-label">Highlights (3 shown under the hero)</span>
          <div className="grid gap-3 sm:grid-cols-3">
            {s.stats.map((st, i) => (
              <div key={i} className="border-line space-y-2 rounded-2xl border p-3">
                <input className="field !py-2" value={st.value} placeholder="Value" maxLength={20}
                  onChange={(e) => set("stats", s.stats.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))} />
                <input className="field !py-2" value={st.label} placeholder="Label" maxLength={30}
                  onChange={(e) => set("stats", s.stats.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-bronze text-2xl">About / brand story</h2>
        {text("aboutTitle", "Title", { maxLength: 80 })}
        <label className="block">
          <span className="field-label">Story (leave a blank line between paragraphs)</span>
          <textarea className="field min-h-44" value={s.aboutText} onChange={(e) => set("aboutText", e.target.value)} maxLength={5000} />
        </label>
        <div className="max-w-xs">
          <ImageUploader
            value={s.aboutImage ? [s.aboutImage] : []}
            onChange={(v) => setPhoto("aboutImage", v[0] ?? null)}
            max={1}
            folder="site"
            label="Story photo"
            hint="e.g. you at work, or your crystals and tools."
          />
        </div>
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-bronze text-2xl">Policy pages</h2>
        {(Object.keys(POLICY_TITLES) as PolicyKey[]).map((k) => (
          <label key={k} className="block">
            <span className="field-label">{POLICY_TITLES[k]}</span>
            <textarea
              className="field min-h-36"
              value={s.policies[k]}
              onChange={(e) => set("policies", { ...s.policies, [k]: e.target.value })}
              maxLength={10000}
            />
          </label>
        ))}
      </Card>

      <div className="bg-cream/90 border-line fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-3 sm:px-8">
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
          {!error && dirty && !pending && <p className="text-rose-deep text-sm">You have unsaved changes</p>}
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : saved ? <><Check className="size-4" /> Saved</> : "Save settings"}
          </button>
        </div>
      </div>
    </form>
  );
}
