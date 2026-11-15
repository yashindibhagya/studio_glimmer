import type { CollectionName, Collections } from "@/lib/types";

export interface Store {
  list<C extends CollectionName>(collection: C): Promise<Collections[C][]>;
  get<C extends CollectionName>(collection: C, id: string): Promise<Collections[C] | null>;
  put<C extends CollectionName>(collection: C, doc: Collections[C]): Promise<void>;
  putMany<C extends CollectionName>(collection: C, docs: Collections[C][]): Promise<void>;
  remove(collection: CollectionName, id: string): Promise<void>;
  uploadImage(bytes: Uint8Array, contentType: string, folder: string): Promise<string>;
  deleteImage(url: string): Promise<void>;
}
