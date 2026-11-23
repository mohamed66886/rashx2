import 'server-only';
import { cookies } from 'next/headers';
import {
  verifySessionCookie,
  verifyIdToken,
  createSessionCookie,
  revokeRefreshTokens,
  MembershipRepository,
  getFirebaseAdminFirestore,
  firestorePaths,
  type TenantContext,
} from './firebase-server';
import { getAuthoritativeTenant } from './tenant';
import {
  getSessionCookieConfig,
  extractSessionCookie,
  PROD_COOKIE_NAME,
  DEV_COOKIE_NAME,
} from './session-cookie';
import type { MembershipRole } from '@rashx/database';

export {
  verifySessionCookie,
  verifyIdToken,
  createSessionCookie,
  revokeRefreshTokens,
  getAuthoritativeTenant,
  getSessionCookieConfig,
  extractSessionCookie,
  PROD_COOKIE_NAME,
  DEV_COOKIE_NAME,
};

export interface TenantSession {
  user: {
    uid: string;
    email?: string;
    displayName?: string;
  };
  tenant: TenantContext;
  membership: {
    role: MembershipRole;
    title?: string;
    joinedAt: string;
  };
}

/**
 * Validates the session cookie for the current request against authoritative tenant membership.
 * Safe to call from Next.js Server Components, Server Actions, or Route Handlers.
 * Returns null if unauthenticated, session expired, or user is not an active member.
 */
export async function getTenantSession(): Promise<TenantSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = extractSessionCookie(cookieStore);

  if (!sessionCookie) {
    return null;
  }

  // Authoritatively verify session cookie
  let verifiedUser;
  try {
    verifiedUser = await verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }

  // Resolve tenant from host
  const tenant = await getAuthoritativeTenant(false);
  if (!tenant || tenant.status !== 'ACTIVE') {
    return null;
  }

  const db = getFirebaseAdminFirestore();
  const membershipRepo = new MembershipRepository(db);
  const membership = await membershipRepo.getMembership(tenant.tenantId, verifiedUser.uid);

  if (membership && membership.status === 'ACTIVE') {
    return {
      user: {
        uid: verifiedUser.uid,
        email: verifiedUser.email,
        displayName: verifiedUser.displayName,
      },
      tenant,
      membership: {
        role: membership.role,
        title: membership.title,
        joinedAt: membership.joinedAt,
      },
    };
  }

  // Check platform admin fallback
  const adminSnap = await db.doc(firestorePaths.platformAdmin(verifiedUser.uid)).get();
  if (adminSnap.exists && adminSnap.data()?.isActive === true) {
    return {
      user: {
        uid: verifiedUser.uid,
        email: verifiedUser.email,
        displayName: verifiedUser.displayName,
      },
      tenant,
      membership: {
        role: 'OWNER',
        title: 'مدير المنصة',
        joinedAt: tenant.resolvedAt,
      },
    };
  }

  return null;
}

/**
 * Validates session and evaluates authoritative server-time subscription status.
 * Reusable for Server Components and operational guards.
 */
export async function getTenantSubscriptionSession() {
  const session = await getTenantSession();
  if (!session) return null;

  const db = getFirebaseAdminFirestore();
  const subRepo = new (await import('@rashx/database/server')).SubscriptionRepository(db);

  const subscription = await subRepo.getSubscription(session.tenant.tenantId);
  const evaluation = await subRepo.verifyOperationalAccess(session.tenant.tenantId);

  return {
    ...session,
    subscription,
    subscriptionEvaluation: evaluation,
  };
}

