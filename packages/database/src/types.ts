/**
 * @rashx/database - Shared Firestore Types & Interfaces
 */

export interface BaseEntity {
  id: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type FirestoreDocumentData = Record<string, unknown>;

