import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { CollectionName, Collections } from "@/lib/types";
import type { Store } from "./types";

/**
 * Development-only store: keeps everything in .data/db.json and uploaded
 * images in .data/uploads (served by the /uploads route).
 * Production uses Cloudinary instead.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

type Db = { [C in CollectionName]?: Collections[C][] };

let writeQueue: Promise<unknown> = Promise.resolve();

async function readDb(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as Db;
  } catch {
    return {};
  }
}

function mutate(fn: (db: Db) => void): Promise<void> {
  const run = writeQueue.then(async () => {
    const db = await readDb();
    fn(db);
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, DB_FILE);
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

export const localStore: Store = {
  async list(collection) {
    const db = await readDb();
    return (db[collection] ?? []) as never;
  },
  async get(collection, id) {
    const db = await readDb();
    const rows = (db[collection] ?? []) as { id: string }[];
    return (rows.find((r) => r.id === id) ?? null) as never;
  },
  async put(collection, doc) {
    await mutate((db) => {
      const rows = ((db[collection] ?? []) as { id: string }[]).filter((r) => r.id !== doc.id);
      rows.push(doc);
      (db as Record<string, unknown>)[collection] = rows;
    });
  },
  async putMany(collection, docs) {
    await mutate((db) => {
      const ids = new Set(docs.map((d) => d.id));
      const rows = ((db[collection] ?? []) as { id: string }[]).filter((r) => !ids.has(r.id));
      (db as Record<string, unknown>)[collection] = [...rows, ...docs];
    });
  },
  async remove(collection, id) {
    await mutate((db) => {
      const rows = (db[collection] ?? []) as { id: string }[];
      (db as Record<string, unknown>)[collection] = rows.filter((r) => r.id !== id);
    });
  },
  async uploadImage(bytes, contentType, folder) {
    const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
    const name = `${folder}-${randomUUID()}.${ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), bytes);
    return `/uploads/${name}`;
  },
  async deleteImage(url) {
    if (!url.startsWith("/uploads/")) return;
    const name = path.basename(url);
    await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
  },
};
