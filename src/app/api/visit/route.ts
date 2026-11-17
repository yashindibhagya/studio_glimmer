import { after, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { recordVisit, visitorCode } from "@/lib/visits";

const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|facebookexternalhit|whatsapp|curl|wget/i;
const done = () => new Response(null, { status: 204 });

/**
 * Counts one page view for the admin dashboard. Called by <VisitTracker /> on the public site.
 *
 * Only the live site counts: local development and Vercel preview links share the
 * live shop's data, so counting them would add your own testing to the numbers.
 */
export async function POST(request: NextRequest) {
  const live = process.env.NODE_ENV === "production" && (process.env.VERCEL_ENV ?? "production") === "production";
  if (!live && process.env.COUNT_VISITS !== "1") return done();

  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return done();

  const agent = request.headers.get("user-agent") ?? "";
  if (!agent || BOTS.test(agent)) return done();

  // Your own browsing while signed in to the admin portal isn't a customer visit.
  if (await verifySession(request.cookies.get(SESSION_COOKIE)?.value)) return done();

  const body = (await request.json().catch(() => null)) as { path?: unknown; vid?: unknown } | null;
  const path = typeof body?.path === "string" ? body.path : "";
  if (!/^\/[\w\-./]{0,120}$/.test(path) || path.startsWith("/admin") || path.startsWith("/api")) return done();

  const vid =
    typeof body?.vid === "string" && /^[\w-]{8,64}$/.test(body.vid)
      ? body.vid
      : `${request.headers.get("x-forwarded-for")?.split(",")[0] ?? ""}|${agent}`;

  // Saved after the reply is sent, so counting never slows a page down.
  after(() => recordVisit(path, visitorCode(vid)).catch((e) => console.error("[visits] could not save", e)));
  return done();
}
