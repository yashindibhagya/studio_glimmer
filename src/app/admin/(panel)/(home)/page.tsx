import Link from "next/link";
import { AlertTriangle, ArrowRight, Inbox, Package, Plus, Star, Images } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ensureSeeded, readSettings } from "@/lib/data";
import { store, usingCloudinary } from "@/lib/store";
import { Card, PageHeader, StatusPill } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdmin();
  await ensureSeeded();
  const [products, requests, reviews, gallery, settings] = await Promise.all([
    store.list("products"),
    store.list("requests"),
    store.list("reviews"),
    store.list("gallery"),
    readSettings(),
  ]);

  const newRequests = requests.filter((r) => r.status === "new");
  const recent = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const sampleProducts = products.filter((p) => p.sample).length;
  const sampleReviews = reviews.filter((r) => r.sample).length;
  const noPhotos = products.filter((p) => p.images.length === 0).length;

  const todos = [
    !settings.whatsappNumber && { text: "Add your WhatsApp number so customers can send orders", href: "/admin/settings" },
    sampleProducts > 0 && { text: `Replace or delete ${sampleProducts} sample product(s)`, href: "/admin/products" },
    noPhotos > 0 && { text: `Add photos to ${noPhotos} product(s)`, href: "/admin/products" },
    sampleReviews > 0 && { text: `Replace ${sampleReviews} sample review(s) with real ones`, href: "/admin/reviews" },
    gallery.length === 0 && { text: "Upload photos of past work to the gallery", href: "/admin/gallery" },
    !settings.heroImage && { text: "Upload a homepage hero photo (optional — the logo shows until then)", href: "/admin/settings" },
  ].filter(Boolean) as { text: string; href: string }[];

  return (
    <>
      <PageHeader
        title="Welcome back ✨"
        description={
          usingCloudinary
            ? "Here's what's happening in your shop."
            : "Local mode — changes are saved on this computer only."
        }
        action={
          <Link href="/admin/products/new" className="btn-primary !py-3">
            <Plus className="size-4" /> Add product
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat href="/admin/requests" Icon={Inbox} label="New requests" value={newRequests.length} highlight={newRequests.length > 0} />
        <Stat href="/admin/products" Icon={Package} label="Products live" value={products.filter((p) => p.visible).length} />
        <Stat href="/admin/reviews" Icon={Star} label="Reviews" value={reviews.length} />
        <Stat href="/admin/gallery" Icon={Images} label="Gallery photos" value={gallery.length} />
      </div>

      {todos.length > 0 && (
        <Card className="mt-6 !border-amber-200 !bg-amber-50/60 dark:!border-amber-900/60 dark:!bg-amber-950/30">
          <h2 className="text-bronze flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4 text-amber-600" /> Before you launch
          </h2>
          <ul className="mt-3 space-y-2">
            {todos.map((t) => (
              <li key={t.text}>
                <Link href={t.href} className="text-bronze flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-amber-100/60 dark:hover:bg-amber-900/30">
                  {t.text} <ArrowRight className="size-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-bronze text-2xl">Latest custom requests</h2>
          <Link href="/admin/requests" className="text-rose-deep text-sm hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted mt-4 text-sm">No requests yet. They&apos;ll appear here when customers use the Custom Order form.</p>
        ) : (
          <ul className="divide-line mt-4 divide-y">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/requests#${r.id}`} className="hover:bg-blush/40 -mx-3 flex items-center justify-between gap-4 rounded-xl px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-bronze text-sm font-medium">{r.name}</p>
                    <p className="text-muted truncate text-xs">{r.description}</p>
                  </div>
                  <StatusPill status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function Stat({
  href,
  Icon,
  label,
  value,
  highlight,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className={`border-line rounded-3xl border p-5 transition hover:-translate-y-0.5 ${highlight ? "bg-rose-gold text-white" : "bg-ivory"}`}>
      <Icon className={`size-5 ${highlight ? "text-white" : "text-rose"}`} strokeWidth={1.5} />
      <p className={`font-display mt-3 text-4xl ${highlight ? "" : "text-bronze"}`}>{value}</p>
      <p className={`text-xs tracking-wider uppercase ${highlight ? "text-white/80" : "text-muted"}`}>{label}</p>
    </Link>
  );
}
