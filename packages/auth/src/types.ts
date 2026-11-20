/**
 * @rashx/auth - Shared Types & Interfaces
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface FirebaseAdminServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export interface FirebaseAdminConfig {
  projectId: string;
  clientEmail?: string;
  privateKey?: string;
  useApplicationDefault?: boolean;
}

export interface VerifiedUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  claims: Record<string, unknown>;
  authTime: number; // Seconds since Unix epoch
  issuedAt: number; // Seconds since Unix epoch
  expiresAt: number; // Seconds since Unix epoch
}

