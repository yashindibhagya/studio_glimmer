import type { Metadata } from "next";
import { getCategories, getSettings } from "@/lib/data";
import { CustomOrderForm } from "@/components/site/custom-order-form";
import { Sparkle, SparkleRule } from "@/components/site/ornaments";

export const metadata: Metadata = {
  title: "Custom Orders",
  description: "Tell us your idea — names, dates, logos or themes — and we'll create a one-of-a-kind rhinestone piece for you.",
};

export default async function CustomOrderPage() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-10 pb-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pt-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow mb-3">Made just for you</p>
        <h1 className="font-display text-bronze text-5xl leading-none sm:text-6xl">
          <span className="font-script text-rose-gold block text-6xl sm:text-7xl">Custom</span>
          Creations
        </h1>
        <SparkleRule className="mt-6 !justify-start" />
        <p className="text-muted mt-6 max-w-md leading-relaxed">
          Have something special in mind? Share your idea and any reference photos — we&apos;ll get back to you on
          WhatsApp with a design, price and timeline. No commitment until you&apos;re happy.
        </p>
        <ul className="mt-8 space-y-4">
          {[
            "Names, initials, dates & logos",
            "Wedding, birthday & bridal party sets",
            "Matching colours to your theme",
            "Bulk & corporate gifting",
          ].map((t) => (
            <li key={t} className="text-bronze flex items-center gap-3">
              <Sparkle className="text-rose size-3 shrink-0" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-ivory border-line rounded-[2rem] border p-6 sm:p-10">
        <CustomOrderForm
          categories={categories.map(({ id, name }) => ({ id, name }))}
          whatsappNumber={settings.whatsappNumber}
        />
      </div>
    </div>
  );
}
