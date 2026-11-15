"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ExternalLink,
  HelpCircle,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Star,
  Tags,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { OnNavigate, PathnameRender } from "@/components/site/pathname";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: Tags },
  { href: "/admin/requests", label: "Custom Requests", Icon: Inbox },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
  { href: "/admin/faqs", label: "FAQs", Icon: HelpCircle },
  { href: "/admin/settings", label: "Site Settings", Icon: Settings },
];

export function AdminNav() {
  const [open, setOpen] = useState(false);

  const links = (pathname: string) => (
    <nav className="flex flex-col gap-1">
      {LINKS.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              active ? "bg-bronze text-cream" : "text-bronze hover:bg-blush"
            }`}
          >
            <Icon className="size-4" strokeWidth={1.6} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-line mt-auto flex flex-col gap-1 border-t pt-4">
      <a href="/" target="_blank" className="text-bronze hover:bg-blush flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm">
        <ExternalLink className="size-4" strokeWidth={1.6} /> View website
      </a>
      <form action={logoutAction}>
        <button type="submit" className="text-bronze hover:bg-blush flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm">
          <LogOut className="size-4" strokeWidth={1.6} /> Sign out
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-end gap-1 leading-none">
      <span className="font-script text-rose-gold text-3xl">Studio</span>
      <span className="font-display text-bronze pb-1 text-xs tracking-[0.35em]">GLIMMER</span>
    </Link>
  );

  return (
    <>
      <OnNavigate onChange={() => setOpen(false)} />
      {/* Mobile top bar */}
      <div className="bg-ivory border-line sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden">
        {brand}
        <button type="button" onClick={() => setOpen(true)} className="text-bronze p-2" aria-label="Open admin menu">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="bg-ink/30 absolute inset-0" onClick={() => setOpen(false)} />
          <aside className="bg-ivory absolute inset-y-0 left-0 flex w-72 flex-col gap-6 p-5">
            <div className="flex items-center justify-between">
              {brand}
              <button type="button" onClick={() => setOpen(false)} className="text-bronze p-2" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <PathnameRender render={links} />
            {footer}
          </aside>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="bg-ivory border-line sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r p-5 lg:flex">
        <div className="px-3 pt-2">
          {brand}
          <p className="eyebrow mt-1 !text-[0.6rem]">Admin portal</p>
        </div>
        <PathnameRender render={links} />
        {footer}
      </aside>
    </>
  );
}
