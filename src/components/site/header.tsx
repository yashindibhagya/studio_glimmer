"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { useBag } from "./bag-context";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";
import { Sparkle } from "./ornaments";
import { OnNavigate, PathnameRender } from "./pathname";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/custom-order", label: "Custom Order" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function Header({ categories }: { categories: Pick<Category, "id" | "slug" | "name">[] }) {
  const { lines, wishlist, ready, setOpen } = useBag();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <header
      className={`print:hidden sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-cream/90 shadow-[0_8px_30px_-20px_rgb(92_52_34/0.4)] backdrop-blur-md" : "bg-cream"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="text-bronze -ml-2 p-2 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </button>

        <Wordmark className="lg:mr-6" />

        <OnNavigate onChange={() => setMenuOpen(false)} />
        <PathnameRender render={(pathname) => <DesktopNav pathname={pathname} />} />

        <div className="text-bronze flex items-center gap-1 sm:gap-2">
          <ThemeToggle className="p-2 transition-colors hover:text-rose" />
          <Link href="/shop?focus=search" className="hidden p-2 transition-colors hover:text-rose sm:block" aria-label="Search products">
            <Search className="size-[1.15rem]" strokeWidth={1.5} />
          </Link>
          <Link href="/wishlist" className="relative p-2 transition-colors hover:text-rose" aria-label="Wishlist">
            <Heart className="size-[1.15rem]" strokeWidth={1.5} />
            {ready && wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative p-2 transition-colors hover:text-rose"
            aria-label={`Order bag, ${count} items`}
          >
            <ShoppingBag className="size-[1.15rem]" strokeWidth={1.5} />
            {ready && count > 0 && <Badge n={count} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`bg-black/40 absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={`bg-cream absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto px-7 py-6 transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          inert={!menuOpen}
        >
          <div className="flex items-center justify-between">
            <Wordmark />
            <button type="button" onClick={() => setMenuOpen(false)} className="text-bronze p-2" aria-label="Close menu">
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-5" aria-label="Mobile">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="font-display text-bronze text-3xl">
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="eyebrow mt-10 mb-4">Shop by category</p>
          <div className="flex flex-col gap-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className="text-muted text-sm hover:text-rose">
                {c.name}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="bg-rose-gold absolute top-0.5 right-0 flex size-4 items-center justify-center rounded-full text-[0.6rem] font-medium text-white">
      {n > 9 ? "9+" : n}
    </span>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`relative text-[0.7rem] tracking-[0.28em] uppercase transition-colors ${
            isActive(item.href) ? "text-rose-deep" : "text-bronze hover:text-rose"
          }`}
        >
          {item.label}
          {isActive(item.href) && <Sparkle className="text-rose absolute -bottom-3 left-1/2 size-2 -translate-x-1/2" />}
        </Link>
      ))}
    </nav>
  );
}
