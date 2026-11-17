import Link from "next/link";
import { AlertTriangle, ArrowRight, Inbox, Package, Plus, Star, Images } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ensureSeeded, readSettings } from "@/lib/data";
import { store, usingCloudinary } from "@/lib/store";
import { readVisitStats, type VisitStats } from "@/lib/visits";
import { Card, PageHeader, StatusPill } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdmin();
  await ensureSeeded();
  const [products, requests, reviews, gallery, settings, visits] = await Promise.all([
    store.list("products"),
    store.list("requests"),
    store.list("reviews"),
    store.list("gallery"),
    readSettings(),
    readVisitStats(),
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

      <Visitors stats={visits} />

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

function Visitors({ stats }: { stats: VisitStats }) {
  const peak = Math.max(1, ...stats.daily.map((d) => d.visitors));
  const totals = [
    { label: "Today", ...stats.today },
    { label: "Last 7 days", ...stats.week },
    { label: "Last 30 days", ...stats.month },
  ];

  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-bronze text-2xl">Website visitors</h2>
        <p className="text-muted text-xs">People who opened your site · Sri Lanka time</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {totals.map((t) => (
          <div key={t.label} className="bg-blush/40 rounded-2xl p-4">
            <p className="font-display text-bronze text-3xl sm:text-4xl">{t.visitors.toLocaleString("en")}</p>
            <p className="text-muted text-xs tracking-wider uppercase">{t.label}</p>
            <p className="text-muted mt-1 text-xs">{t.views.toLocaleString("en")} page views</p>
          </div>
        ))}
      </div>

      {stats.month.views === 0 ? (
        <p className="text-muted mt-5 text-sm">
          No visits counted yet. Numbers start appearing once customers open the live site — your own visits while
          signed in here aren&apos;t counted.
        </p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[3fr_2fr]">
          <div>
            <p className="eyebrow !text-[0.65rem]">Visitors per day</p>
            <div className="mt-3 flex h-32 items-end gap-1.5" role="img" aria-label="Visitors per day for the last 14 days">
              {stats.daily.map((d) => (
                <div key={d.id} className="flex h-full flex-1 flex-col justify-end" title={`${d.label}: ${d.visitors} visitors, ${d.views} page views`}>
                  <span className="text-muted mb-1 text-center text-[0.65rem]">{d.visitors || ""}</span>
                  <div className="bg-rose-gold min-h-0.5 rounded-t-md" style={{ height: `${(d.visitors / peak) * 80}%` }} />
                </div>
              ))}
            </div>
            <div className="text-muted mt-2 flex justify-between text-[0.65rem]">
              <span>{stats.daily[0]?.label}</span>
              <span>Today</span>
            </div>
          </div>

          <div>
            <p className="eyebrow !text-[0.65rem]">Most viewed pages · 30 days</p>
            <ul className="mt-3 space-y-2">
              {stats.topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-bronze truncate">{p.path === "/" ? "Home page" : p.path}</span>
                  <span className="text-muted shrink-0 tabular-nums">{p.views.toLocaleString("en")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
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
