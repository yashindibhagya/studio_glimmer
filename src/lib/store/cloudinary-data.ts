import "server-only";
import type { CollectionName, Collections } from "@/lib/types";
import type { Store } from "./types";
import { cloudinaryConfig, signParams } from "./cloudinary";

/**
 * Shop data (products, settings, requests…) kept on Cloudinary as one private JSON
 * file per collection, under studio-glimmer/data/. The files are "private" type, so
 * they can only be read with the API secret — never from a public link.
 *
 * This suits a small shop with one admin: every save rewrites that collection's file.
 */
const DATA_FOLDER = "studio-glimmer/data";
const READ_CACHE_MS = 5000;

type Row = { id: string };
const cache = new Map<string, { at: number; rows: Row[] }>();
const queues = new Map<string, Promise<unknown>>();

const publicId = (collection: string) => `${DATA_FOLDER}/${collection}.json`;

async function download(collection: string): Promise<Row[]> {
  const { cloud, key, secret } = cloudinaryConfig();
  const params = { public_id: publicId(collection), type: "private", timestamp: Math.floor(Date.now() / 1000) };
  const query = new URLSearchParams({ ...params, timestamp: String(params.timestamp), api_key: key, signature: signParams(params, secret) });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/raw/download?${query}`, { cache: "no-store" });
  if (res.status === 404) return []; // nothing saved yet
  // Any other failure must stop here: treating it as "empty" would overwrite real data on the next save.
  if (!res.ok) throw new Error(`Could not load ${collection} from Cloudinary (${res.status}).`);
  const rows = (await res.json()) as unknown;
  if (!Array.isArray(rows)) throw new Error(`Saved ${collection} data on Cloudinary is not in the expected format.`);
  return rows as Row[];
}

async function upload(collection: string, rows: Row[]) {
  const { cloud, key, secret } = cloudinaryConfig();
  const params = {
    public_id: publicId(collection),
    type: "private",
    overwrite: "true",
    invalidate: "true",
    timestamp: Math.floor(Date.now() / 1000),
  };
  const form = new FormData();
  form.append("file", new Blob([JSON.stringify(rows)], { type: "application/json" }), `${collection}.json`);
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", key);
  form.append("signature", signParams(params, secret));
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/raw/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(`Could not save ${collection} to Cloudinary: ${json?.error?.message ?? res.status}`);
  }
}

/** Reads are remembered for a few seconds so one page load doesn't download the same file repeatedly. */
async function read(collection: string): Promise<Row[]> {
  const hit = cache.get(collection);
  if (hit && Date.now() - hit.at < READ_CACHE_MS) return hit.rows;
  const rows = await download(collection);
  cache.set(collection, { at: Date.now(), rows });
  return rows;
}

/** Saves always start from a fresh download, one at a time per collection, so nothing is overwritten by stale data. */
function mutate(collection: string, fn: (rows: Row[]) => Row[]): Promise<void> {
  const run = (queues.get(collection) ?? Promise.resolve()).then(async () => {
    const next = fn(await download(collection));
    await upload(collection, next);
    cache.set(collection, { at: Date.now(), rows: next });
  });
  queues.set(collection, run.catch(() => undefined));
  return run;
}

export const cloudinaryData: Pick<Store, "list" | "get" | "put" | "putMany" | "remove"> = {
  async list<C extends CollectionName>(collection: C) {
    return (await read(collection)) as Collections[C][];
  },
  async get<C extends CollectionName>(collection: C, id: string) {
    return ((await read(collection)).find((r) => r.id === id) ?? null) as Collections[C] | null;
  },
  put(collection, doc) {
    return mutate(collection, (rows) => [...rows.filter((r) => r.id !== doc.id), doc]);
  },
  putMany(collection, docs) {
    const ids = new Set(docs.map((d) => d.id));
    return mutate(collection, (rows) => [...rows.filter((r) => !ids.has(r.id)), ...docs]);
  },
  remove(collection, id) {
    return mutate(collection, (rows) => rows.filter((r) => r.id !== id));
  },
};
