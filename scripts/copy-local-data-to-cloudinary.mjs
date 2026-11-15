// Copies the shop data saved on this computer (.data/db.json) to Cloudinary.
// Safe to re-run: a collection that already exists on Cloudinary is left untouched.
// Usage: node scripts/copy-local-data-to-cloudinary.mjs
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);
const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = env;
if (!cloud || !key || !secret) throw new Error("Cloudinary keys are missing from .env.local");

const sign = (p) =>
  createHash("sha1").update(Object.keys(p).sort().map((k) => `${k}=${p[k]}`).join("&") + secret).digest("hex");
const api = `https://api.cloudinary.com/v1_1/${cloud}/raw`;
const db = JSON.parse(readFileSync(".data/db.json", "utf8"));

for (const [collection, rows] of Object.entries(db)) {
  const public_id = `studio-glimmer/data/${collection}.json`;
  const check = { public_id, type: "private", timestamp: Math.floor(Date.now() / 1000) };
  const exists = await fetch(`${api}/download?${new URLSearchParams({ ...check, api_key: key, signature: sign(check) })}`);
  if (exists.status !== 404) {
    console.log(`${collection}: already on Cloudinary (status ${exists.status}) — skipped`);
    continue;
  }
  const params = { public_id, type: "private", overwrite: "true", invalidate: "true", timestamp: Math.floor(Date.now() / 1000) };
  const form = new FormData();
  form.append("file", new Blob([JSON.stringify(rows)], { type: "application/json" }), `${collection}.json`);
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", key);
  form.append("signature", sign(params));
  const res = await fetch(`${api}/upload`, { method: "POST", body: form });
  console.log(`${collection}: ${res.ok ? `copied ${rows.length} item(s)` : `FAILED (${res.status})`}`);
}
