import Image from "next/image";
import Link from "next/link";
import type { Category, SiteSettings } from "@/lib/types";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./whatsapp-icon";
import { Sparkle } from "./ornaments";

export function Footer({ settings, categories }: { settings: SiteSettings; categories: Category[] }) {
  const socials = [
    { href: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { href: settings.tiktokUrl, label: "TikTok", Icon: TikTokIcon },
    { href: settings.facebookUrl, label: "Facebook", Icon: FacebookIcon },
    {
      href: settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}` : "",
      label: "WhatsApp",
      Icon: WhatsAppIcon,
    },
  ].filter((s) => s.href);

  return (
    <footer className="bg-blush/60 border-line mt-auto border-t">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <Image src="/logo.webp" alt="Studio Glimmer — Custom Rhinestone Creations, since 2020" width={150} height={150} className="-my-3 logo-blend" />
          <p className="text-muted mt-4 max-w-xs text-sm leading-relaxed">
            Handmade rhinestone creations, hand-placed stone by stone in Sri Lanka.
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="border-rose/40 text-bronze flex size-10 items-center justify-center rounded-full border transition hover:bg-bronze hover:text-cream"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Shop">
          <FooterLink href="/shop">All products</FooterLink>
          {categories.map((c) => (
            <FooterLink key={c.id} href={`/shop?category=${c.slug}`}>{c.name}</FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Studio">
          <FooterLink href="/custom-order">Custom orders</FooterLink>
          <FooterLink href="/gallery">Gallery & reviews</FooterLink>
          <FooterLink href="/about">About us</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/wishlist">Wishlist</FooterLink>
        </FooterCol>

        <FooterCol title="Information">
          <FooterLink href="/policies/shipping">Shipping & delivery</FooterLink>
          <FooterLink href="/policies/returns">Returns & exchanges</FooterLink>
          <FooterLink href="/policies/privacy">Privacy policy</FooterLink>
          <FooterLink href="/policies/terms">Terms of service</FooterLink>
          {settings.email && <FooterLink href={`mailto:${settings.email}`}>{settings.email}</FooterLink>}
          {settings.location && <p className="text-muted text-sm">{settings.location}</p>}
        </FooterCol>
      </div>
      <div className="border-line border-t">
        <div className="text-muted mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-8">
          <p>© Studio Glimmer · Since 2020. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <Sparkle className="text-rose size-2.5" /> Custom rhinestone creations <Sparkle className="text-rose size-2.5" />
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-center md:text-left">
      <p className="eyebrow text-bronze mb-5">{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-muted text-sm transition-colors hover:text-rose-deep">
      {children}
    </Link>
  );
}
