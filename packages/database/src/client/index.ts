/**
 * @rashx/database/client
 *
 * Client-safe Firebase Firestore entrypoint.
 * Safe to import inside browser bundles and React Client Components ('use client').
 */

import {
  getFirestore,
  collection,
  doc,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';
import { getFirebaseClientApp } from '@rashx/auth/client';

let clientFirestoreInstance: Firestore | null = null;

export function getFirebaseClientFirestore(): Firestore {
  if (clientFirestoreInstance) {
    return clientFirestoreInstance;
  }
  const app = getFirebaseClientApp();
  clientFirestoreInstance = getFirestore(app);
  return clientFirestoreInstance;
}

export function resetFirebaseClientFirestore(): void {
  clientFirestoreInstance = null;
}

export function getTypedClientCollection<T extends DocumentData = DocumentData>(
  collectionPath: string
): CollectionReference<T, T> {
  const db = getFirebaseClientFirestore();
  return collection(db, collectionPath) as CollectionReference<T, T>;
}

export function getTypedClientDoc<T extends DocumentData = DocumentData>(
  documentPath: string
): DocumentReference<T, T> {
  const db = getFirebaseClientFirestore();
  return doc(db, documentPath) as DocumentReference<T, T>;
}

export { firestorePaths } from '../paths.js';
export type { BaseEntity, FirestoreDocumentData } from '../types.js';
