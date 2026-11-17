import "server-only";
import { createHash } from "node:crypto";
import { store } from "@/lib/store";
import type { DayVisits } from "@/lib/types";

/** Older days are dropped so the saved file stays small. */
const KEEP_DAYS = 90;
const MAX_SEEN_PER_DAY = 5000;
const MAX_PAGES_PER_DAY = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" });

/** The date in Sri Lanka, as YYYY-MM-DD, `daysAgo` days before now. */
function dayKey(daysAgo = 0) {
  return dayFormat.format(new Date(Date.now() - daysAgo * DAY_MS));
}

/** Turns a visitor's browser id into a short code that can't be traced back to them. */
export function visitorCode(raw: string) {
  return createHash("sha256").update(`${process.env.SESSION_SECRET ?? ""}:${raw}`).digest("hex").slice(0, 16);
}

// One save at a time, so two visits arriving together don't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();

export function recordVisit(path: string, code: string): Promise<void> {
  const run = queue.then(async () => {
    const id = dayKey();
    const existing = await store.get("visits", id);
    const day: DayVisits = existing ?? { id, views: 0, seen: [], pages: {} };
    const pages = { ...day.pages };
    if (path in pages || Object.keys(pages).length < MAX_PAGES_PER_DAY) pages[path] = (pages[path] ?? 0) + 1;
    const seen = day.seen.includes(code) || day.seen.length >= MAX_SEEN_PER_DAY ? day.seen : [...day.seen, code];
    await store.put("visits", { id, views: day.views + 1, seen, pages });

    // First visit of a new day: tidy away days that are too old to show.
    if (!existing) {
      const oldest = dayKey(KEEP_DAYS);
      for (const old of (await store.list("visits")).filter((d) => d.id < oldest)) {
        await store.remove("visits", old.id);
      }
    }
  });
  queue = run.catch(() => undefined);
  return run;
}

export type VisitStats = {
  today: { visitors: number; views: number };
  week: { visitors: number; views: number };
  month: { visitors: number; views: number };
  /** Oldest first, ending today. */
  daily: { id: string; label: string; visitors: number; views: number }[];
  topPages: { path: string; views: number }[];
};

export async function readVisitStats(chartDays = 14): Promise<VisitStats> {
  const byId = new Map((await store.list("visits")).map((d) => [d.id, d]));

  const range = (days: number) => {
    const people = new Set<string>();
    let views = 0;
    for (let i = 0; i < days; i++) {
      const day = byId.get(dayKey(i));
      if (!day) continue;
      views += day.views;
      for (const code of day.seen) people.add(code);
    }
    return { visitors: people.size, views };
  };

  const labelFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "numeric", month: "short" });
  const daily = Array.from({ length: chartDays }, (_, n) => {
    const daysAgo = chartDays - 1 - n;
    const day = byId.get(dayKey(daysAgo));
    return {
      id: dayKey(daysAgo),
      label: labelFormat.format(new Date(Date.now() - daysAgo * DAY_MS)),
      visitors: day?.seen.length ?? 0,
      views: day?.views ?? 0,
    };
  });

  const pageViews = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    for (const [path, n] of Object.entries(byId.get(dayKey(i))?.pages ?? {})) {
      pageViews.set(path, (pageViews.get(path) ?? 0) + n);
    }
  }
  const topPages = [...pageViews]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return { today: range(1), week: range(7), month: range(30), daily, topPages };
}
