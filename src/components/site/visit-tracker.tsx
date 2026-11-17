"use client";

import { OnNavigate } from "@/components/site/pathname";

const KEY = "sg_visitor";

/** A random id kept in this browser, so one person opening many pages counts as one visitor. */
function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return undefined; // private mode etc. — the server falls back to a network-based guess
  }
}

/** Tells the site about each page a customer opens; the totals show on the admin dashboard. */
export function VisitTracker() {
  return (
    <OnNavigate
      onChange={(path) => {
        fetch("/api/visit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ path, vid: visitorId() }),
          keepalive: true,
        }).catch(() => undefined);
      }}
    />
  );
}
