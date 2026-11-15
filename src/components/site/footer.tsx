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
    <footer className="print:hidden bg-blush/60 border-line mt-auto border-t">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 sm:px-8 md:gap-12 md:py-16 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="col-span-2 flex items-center gap-4 md:flex-col md:items-start md:gap-0 lg:col-span-1">
          <Image src="/logo.webp" alt="Studio Glimmer — Custom Rhinestone Creations, since 2020" width={150} height={150} className="logo-blend -m-2 w-24 shrink-0 md:-mx-0 md:-my-3 md:w-[150px]" />
          <div>
            <p className="text-muted max-w-xs text-sm leading-relaxed md:mt-4">
              Handmade rhinestone creations, hand-placed stone by stone in Sri Lanka.
            </p>
            <div className="mt-3 flex gap-2 md:mt-5">
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

        <FooterCol title="Information" wide>
          <FooterLink href="/policies/shipping">Shipping & delivery</FooterLink>
          <FooterLink href="/policies/returns">Returns & exchanges</FooterLink>
          <FooterLink href="/policies/privacy">Privacy policy</FooterLink>
          <FooterLink href="/policies/terms">Terms of service</FooterLink>
          {settings.email && <FooterLink href={`mailto:${settings.email}`}>{settings.email}</FooterLink>}
          {settings.location && <p className="text-muted text-sm">{settings.location}</p>}
        </FooterCol>
      </div>
      <div className="border-line border-t">
        <div className="text-muted mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-5 py-4 text-center text-xs sm:flex-row sm:px-8 md:py-5">
          <p>© Studio Glimmer · Since 2020. All rights reserved.</p>
          <p className="hidden items-center gap-2 sm:flex">
            <Sparkle className="text-rose size-2.5" /> Custom rhinestone creations <Sparkle className="text-rose size-2.5" />
          </p>
        </div>
      </div>
    </footer>
  );
}

/** `wide` columns span the full width on phones and lay their links out in a wrapping row to save height. */
function FooterCol({ title, wide = false, children }: { title: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "col-span-2 lg:col-span-1" : ""}>
      <p className="eyebrow text-bronze mb-3 md:mb-5">{title}</p>
      <div className={wide ? "flex flex-row flex-wrap gap-x-5 gap-y-2 md:flex-col md:gap-3" : "flex flex-col gap-2 md:gap-3"}>{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-muted py-0.5 text-sm transition-colors hover:text-rose-deep">
      {children}
    </Link>
  );
}
