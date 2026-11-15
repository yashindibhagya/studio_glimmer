import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { initializeFirestore, type Firestore } from "firebase-admin/firestore";
import type { Store } from "./types";
import * as cloudinary from "./cloudinary";

/**
 * Production store: data in Firebase Firestore (free Spark plan), images on Cloudinary.
 * One Firestore collection per data type (products, categories, …), document id = item id.
 * Only the server talks to Firestore, using a service account; firestore.rules blocks
 * all browser access.
 */
let db: Firestore | null = null;

function firestore() {
  if (db) return db;
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Env vars store the key's newlines as "\n".
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  // REST transport starts faster on serverless; optional fields may be undefined.
  db = initializeFirestore(app, { preferRest: true });
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

const BATCH_LIMIT = 450; // Firestore allows 500 writes per batch

export const firebaseStore: Store = {
  async list(collection) {
    const snap = await firestore().collection(collection).get();
    return snap.docs.map((d) => d.data()) as never;
  },
  async get(collection, id) {
    const snap = await firestore().collection(collection).doc(id).get();
    return (snap.exists ? snap.data() : null) as never;
  },
  async put(collection, doc) {
    await firestore().collection(collection).doc(doc.id).set(doc);
  },
  async putMany(collection, docs) {
    for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
      const batch = firestore().batch();
      for (const doc of docs.slice(i, i + BATCH_LIMIT)) {
        batch.set(firestore().collection(collection).doc(doc.id), doc);
      }
      await batch.commit();
    }
  },
  async remove(collection, id) {
    await firestore().collection(collection).doc(id).delete();
  },
  uploadImage: cloudinary.uploadImage,
  deleteImage: cloudinary.deleteImage,
};
