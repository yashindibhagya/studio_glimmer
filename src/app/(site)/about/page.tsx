import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { Diamond, SparkleRule } from "@/components/site/ornaments";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/whatsapp-icon";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Studio Glimmer — custom rhinestone creations, hand-made in Sri Lanka since 2020.",
};

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-8 lg:pt-16">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div className="relative mx-auto w-full max-w-md">
          <div className="ring-rose-gold rounded-t-full rounded-b-[2.2rem] p-2.5">
            <div className="bg-blush relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[1.8rem]">
              {settings.aboutImage ? (
                <Image src={settings.aboutImage} alt="Studio Glimmer" fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-placeholder">
                  <Image src="/logo.webp" alt="Studio Glimmer logo" width={380} height={380} priority className="w-[90%] logo-blend [mask-image:radial-gradient(circle_closest-side,black_84%,transparent_100%)]" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">Our story</p>
          <h1 className="font-display text-bronze text-5xl sm:text-6xl">{settings.aboutTitle}</h1>
          <SparkleRule className="mt-6 !justify-start" />
          <div className="prose-glimmer text-muted mt-6 text-lg leading-relaxed">
            {settings.aboutText.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {settings.stats.map((s) => (
              <div key={s.label} className="border-line rounded-2xl border p-4 text-center">
                <p className="font-display text-bronze text-2xl">{s.value}</p>
                <p className="eyebrow mt-1 !text-[0.58rem]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section id="contact" className="keep-dark bg-bronze text-cream mt-24 rounded-[2.5rem] px-6 py-16 text-center sm:px-12">
        <Diamond className="text-rose-light mx-auto w-10" />
        <h2 className="font-display mt-4 text-4xl sm:text-5xl">Let&apos;s create together</h2>
        <p className="text-cream/70 mx-auto mt-4 max-w-lg">
          Questions, custom ideas or bulk orders — we&apos;d love to hear from you.
          {settings.location && <><br />{settings.location}</>}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {settings.whatsappNumber && (
            <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="btn-primary btn-gold">
              <WhatsAppIcon className="size-4" /> WhatsApp us
            </a>
          )}
          <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !border-rose-light !text-cream hover:!bg-cream hover:!text-bronze">
            <InstagramIcon className="size-4" /> Instagram
          </a>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="btn-outline !border-rose-light !text-cream hover:!bg-cream hover:!text-bronze">
              {settings.email}
            </a>
          )}
        </div>
        <Link href="/custom-order" className="text-rose-light mt-8 inline-block text-sm underline underline-offset-4">
          Or send us a custom order request →
        </Link>
      </section>
    </div>
  );
}
