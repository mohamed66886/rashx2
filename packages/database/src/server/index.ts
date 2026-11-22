import 'server-only';
import {
  getFirestore,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
} from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@rashx/auth/server';

let adminFirestoreInstance: Firestore | null = null;

export function getFirebaseAdminFirestore(): Firestore {
  if (adminFirestoreInstance) {
    return adminFirestoreInstance;
  }
  const app = getFirebaseAdminApp();
  adminFirestoreInstance = getFirestore(app);
  return adminFirestoreInstance;
}

export function resetFirebaseAdminFirestore(): void {
  adminFirestoreInstance = null;
}

export function getTypedAdminCollection<T extends DocumentData = DocumentData>(
  collectionPath: string
): CollectionReference<T> {
  const db = getFirebaseAdminFirestore();
  return db.collection(collectionPath) as CollectionReference<T>;
}

export function getTypedAdminDoc<T extends DocumentData = DocumentData>(
  documentPath: string
): DocumentReference<T> {
  const db = getFirebaseAdminFirestore();
  return db.doc(documentPath) as DocumentReference<T>;
}

export { firestorePaths } from '../paths';
export type { BaseEntity, FirestoreDocumentData } from '../types';

// Repositories (Server-only)
export {
  TenantRepository,
  TenantProvisioningError,
  TenantProvisioningErrorCode,
  type TenantProvisioningResult,
  type TenantAuthorizationContext,
} from './repositories/tenant.repository';

export {
  MembershipRepository,
  MembershipError,
  MembershipErrorCode,
  type MembershipActor,
  type MembershipAuditLog,
} from './repositories/membership.repository';

export {
  AppointmentRepository,
  AppointmentError,
  AppointmentErrorCode,
  type AppointmentActor,
  type AppointmentMutationResult,
} from './repositories/appointment.repository';

// Authoritative Tenant Resolution & Context (Server-only)
export {
  TenantResolver,
  getTenantResolver,
  resetTenantResolver,
  type TenantContext,
  type TenantResolutionOutcome,
  type TenantResolutionErrorCode,
  type TenantResolverOptions,
} from './tenant-resolver';
