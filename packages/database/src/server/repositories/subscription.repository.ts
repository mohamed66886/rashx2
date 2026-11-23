import 'server-only';
import { randomUUID } from 'node:crypto';
import type { firestore } from 'firebase-admin';
import { firestorePaths } from '../../paths';
import {
  SubscriptionDocSchema,
  SubscriptionAuditDocSchema,
  evaluateSubscriptionStatus,
  type SubscriptionDoc,
  type SubscriptionStatus,
  type SubscriptionAuditDoc,
  type SubscriptionAccessEvaluation,
} from '../../subscription.schema';

export class SubscriptionError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export class SubscriptionNotFoundError extends SubscriptionError {
  constructor(tenantId: string) {
    super('SUBSCRIPTION_NOT_FOUND', `Subscription record not found for tenant '${tenantId}'.`);
  }
}

export class SubscriptionUnauthorizedError extends SubscriptionError {
  constructor(message: string = 'Caller is not authorized to perform administrative subscription actions.') {
    super('SUBSCRIPTION_UNAUTHORIZED', message);
  }
}

export class SubscriptionAccessError extends SubscriptionError {
  constructor(
    public readonly evaluation: SubscriptionAccessEvaluation,
    message: string = 'Salon operational access is restricted due to subscription status.'
  ) {
    super(evaluation.reason || 'SUBSCRIPTION_RESTRICTED', message);
  }
}

export interface ActivateSubscriptionParams {
  tenantId: string;
  adminUid: string;
  durationDays: number;
  planId?: string;
  note?: string;
  now?: Date;
}

export interface SuspendSubscriptionParams {
  tenantId: string;
  adminUid: string;
  reason: string;
  now?: Date;
}

export class SubscriptionRepository {
  constructor(private readonly db: firestore.Firestore) {}

  /**
   * Reads the canonical subscription document for a tenant.
   */
  async getSubscription(tenantId: string): Promise<SubscriptionDoc | null> {
    const cleanTenantId = tenantId.trim();
    const docRef = this.db.doc(firestorePaths.subscription(cleanTenantId));
    const snap = await docRef.get();

    if (!snap.exists) {
      return null;
    }

    return SubscriptionDocSchema.parse(snap.data());
  }

  /**
   * Creates an authoritative 3-day (72-hour) TRIALING subscription for a newly provisioned tenant.
   * Can be executed within an existing Firestore transaction during tenant creation.
   */
  async createTrialSubscription(
    tenantId: string,
    planId: string = 'STARTER',
    options?: {
      transaction?: firestore.Transaction;
      now?: Date;
      actorUid?: string;
    }
  ): Promise<SubscriptionDoc> {
    const cleanTenantId = tenantId.trim();
    const now = options?.now || new Date();
    const nowIso = now.toISOString();

    // Exactly 72 hours (3 days) trial duration calculated authoritatively by server time
    const trialEndsMs = now.getTime() + 72 * 60 * 60 * 1000;
    const trialEndsIso = new Date(trialEndsMs).toISOString();

    const subscriptionData: SubscriptionDoc = SubscriptionDocSchema.parse({
      tenantId: cleanTenantId,
      planId,
      status: 'TRIALING',
      trialStartedAt: nowIso,
      trialEndsAt: trialEndsIso,
      trialDurationDays: 3,
      currentPeriodStartedAt: null,
      currentPeriodEndsAt: null,
      activatedAt: null,
      activatedBy: null,
      lastActivationNote: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    const auditRecord: SubscriptionAuditDoc = SubscriptionAuditDocSchema.parse({
      id: randomUUID(),
      tenantId: cleanTenantId,
      action: 'TRIAL_CREATED',
      actorUid: options?.actorUid || 'system',
      previousStatus: 'TRIALING',
      newStatus: 'TRIALING',
      durationDays: 3,
      note: 'Automatic 3-day trial initialized upon tenant provisioning.',
      timestamp: nowIso,
    });

    const subRef = this.db.doc(firestorePaths.subscription(cleanTenantId));
    const auditRef = this.db.doc(firestorePaths.subscriptionAuditRecord(cleanTenantId, auditRecord.id));

    if (options?.transaction) {
      options.transaction.set(subRef, subscriptionData);
      options.transaction.set(auditRef, auditRecord);
    } else {
      const batch = this.db.batch();
      batch.set(subRef, subscriptionData);
      batch.set(auditRef, auditRecord);
      await batch.commit();
    }

    return subscriptionData;
  }

  /**
   * Evaluates operational access for a tenant against authoritative server time.
   */
  async verifyOperationalAccess(
    tenantId: string,
    serverTime: Date = new Date()
  ): Promise<SubscriptionAccessEvaluation> {
    const cleanTenantId = tenantId.trim();
    const subscription = await this.getSubscription(cleanTenantId);
    return evaluateSubscriptionStatus(subscription, serverTime);
  }

  /**
   * Idempotent check & synchronization of expired trial or period.
   * If TRIALING and now >= trialEndsAt, safely transitions status to EXPIRED and logs audit.
   */
  async syncExpirationIfNecessary(
    tenantId: string,
    serverTime: Date = new Date()
  ): Promise<SubscriptionDoc | null> {
    const cleanTenantId = tenantId.trim();
    const subRef = this.db.doc(firestorePaths.subscription(cleanTenantId));

    return this.db.runTransaction(async (transaction) => {
      const snap = await transaction.get(subRef);
      if (!snap.exists) return null;

      const sub = SubscriptionDocSchema.parse(snap.data());
      const evaluation = evaluateSubscriptionStatus(sub, serverTime);

      // If document still says TRIALING or ACTIVE but is evaluated as EXPIRED, sync it
      if (evaluation.isExpired && (sub.status === 'TRIALING' || sub.status === 'ACTIVE')) {
        const nowIso = serverTime.toISOString();
        const updatedSub: SubscriptionDoc = {
          ...sub,
          status: 'EXPIRED',
          updatedAt: nowIso,
        };

        const auditRecord: SubscriptionAuditDoc = {
          id: randomUUID(),
          tenantId: cleanTenantId,
          action: 'AUTO_EXPIRED',
          actorUid: 'system',
          previousStatus: sub.status,
          newStatus: 'EXPIRED',
          note: `Subscription automatically expired at server time ${nowIso}.`,
          timestamp: nowIso,
        };

        const auditRef = this.db.doc(
          firestorePaths.subscriptionAuditRecord(cleanTenantId, auditRecord.id)
        );

        transaction.set(subRef, updatedSub);
        transaction.set(auditRef, auditRecord);
        return updatedSub;
      }

      return sub;
    });
  }

  /**
   * Manually activates a subscription after platform administrator review and confirmation.
   * Strict server-side verification of platform administrator identity and active status.
   */
  async activateSubscription(params: ActivateSubscriptionParams): Promise<SubscriptionDoc> {
    const { tenantId, adminUid, durationDays, planId, note } = params;
    const cleanTenantId = tenantId.trim();
    const cleanAdminUid = adminUid.trim();

    if (!durationDays || durationDays < 1) {
      throw new SubscriptionError(
        'INVALID_DURATION',
        'Subscription duration must be at least 1 day.'
      );
    }

    const now = params.now || new Date();
    const nowIso = now.toISOString();
    const periodEndsMs = now.getTime() + durationDays * 24 * 60 * 60 * 1000;
    const periodEndsIso = new Date(periodEndsMs).toISOString();

    const adminRef = this.db.doc(firestorePaths.platformAdmin(cleanAdminUid));
    const subRef = this.db.doc(firestorePaths.subscription(cleanTenantId));
    const tenantRef = this.db.doc(firestorePaths.tenant(cleanTenantId));

    return this.db.runTransaction(async (transaction) => {
      // 1. Authorize platform administrator
      const adminSnap = await transaction.get(adminRef);
      if (!adminSnap.exists || adminSnap.data()?.isActive !== true) {
        throw new SubscriptionUnauthorizedError();
      }

      // 2. Verify tenant exists
      const tenantSnap = await transaction.get(tenantRef);
      if (!tenantSnap.exists) {
        throw new SubscriptionError('TENANT_NOT_FOUND', `Tenant '${cleanTenantId}' does not exist.`);
      }

      // 3. Read current subscription record
      const subSnap = await transaction.get(subRef);
      if (!subSnap.exists) {
        throw new SubscriptionNotFoundError(cleanTenantId);
      }

      const currentSub = SubscriptionDocSchema.parse(subSnap.data());
      const previousStatus = currentSub.status;

      // 4. Construct updated ACTIVE subscription record
      const updatedSub: SubscriptionDoc = SubscriptionDocSchema.parse({
        ...currentSub,
        planId: planId || currentSub.planId,
        status: 'ACTIVE',
        currentPeriodStartedAt: nowIso,
        currentPeriodEndsAt: periodEndsIso,
        activatedAt: nowIso,
        activatedBy: cleanAdminUid,
        lastActivationNote: note?.trim() || null,
        updatedAt: nowIso,
      });

      // 5. Construct audit trail record
      const auditRecord: SubscriptionAuditDoc = SubscriptionAuditDocSchema.parse({
        id: randomUUID(),
        tenantId: cleanTenantId,
        action: 'MANUALLY_ACTIVATED',
        actorUid: cleanAdminUid,
        previousStatus,
        newStatus: 'ACTIVE',
        periodStartedAt: nowIso,
        periodEndsAt: periodEndsIso,
        durationDays,
        note: note?.trim() || 'Manual platform administrator activation.',
        timestamp: nowIso,
      });

      const auditRef = this.db.doc(
        firestorePaths.subscriptionAuditRecord(cleanTenantId, auditRecord.id)
      );

      transaction.set(subRef, updatedSub);
      transaction.set(auditRef, auditRecord);

      return updatedSub;
    });
  }

  /**
   * Suspends a salon's subscription (platform administrator action only).
   */
  async suspendSubscription(params: SuspendSubscriptionParams): Promise<SubscriptionDoc> {
    const { tenantId, adminUid, reason } = params;
    const cleanTenantId = tenantId.trim();
    const cleanAdminUid = adminUid.trim();

    const now = params.now || new Date();
    const nowIso = now.toISOString();

    const adminRef = this.db.doc(firestorePaths.platformAdmin(cleanAdminUid));
    const subRef = this.db.doc(firestorePaths.subscription(cleanTenantId));

    return this.db.runTransaction(async (transaction) => {
      const adminSnap = await transaction.get(adminRef);
      if (!adminSnap.exists || adminSnap.data()?.isActive !== true) {
        throw new SubscriptionUnauthorizedError();
      }

      const subSnap = await transaction.get(subRef);
      if (!subSnap.exists) {
        throw new SubscriptionNotFoundError(cleanTenantId);
      }

      const currentSub = SubscriptionDocSchema.parse(subSnap.data());
      const updatedSub: SubscriptionDoc = {
        ...currentSub,
        status: 'SUSPENDED',
        updatedAt: nowIso,
      };

      const auditRecord: SubscriptionAuditDoc = {
        id: randomUUID(),
        tenantId: cleanTenantId,
        action: 'SUSPENDED',
        actorUid: cleanAdminUid,
        previousStatus: currentSub.status,
        newStatus: 'SUSPENDED',
        note: reason.trim(),
        timestamp: nowIso,
      };

      const auditRef = this.db.doc(
        firestorePaths.subscriptionAuditRecord(cleanTenantId, auditRecord.id)
      );

      transaction.set(subRef, updatedSub);
      transaction.set(auditRef, auditRecord);

      return updatedSub;
    });
  }

  /**
   * Retrieves the full audit history for a salon's subscription.
   * Strictly restricted to platform administrators.
   */
  async getSubscriptionAuditTrail(tenantId: string): Promise<SubscriptionAuditDoc[]> {
    const cleanTenantId = tenantId.trim();
    const auditColl = this.db.collection(firestorePaths.subscriptionAuditTrail(cleanTenantId));
    const snap = await auditColl.orderBy('timestamp', 'desc').get();

    return snap.docs.map((d) => SubscriptionAuditDocSchema.parse(d.data()));
  }

  /**
   * Lists all salons with their subscriptions and effective evaluation statuses.
   * For the RASHX Platform Administration dashboard.
   */
  async listSubscriptionsWithTenants(filter?: {
    status?: SubscriptionStatus;
    search?: string;
  }): Promise<
    Array<{
      tenant: {
        id: string;
        name: string;
        commercialName: string;
        slug: string;
        status: string;
        primaryOwnerUid: string;
        createdAt: string;
      };
      subscription: SubscriptionDoc;
      evaluation: SubscriptionAccessEvaluation;
    }>
  > {
    const tenantsSnap = await this.db.collection(firestorePaths.tenants()).get();
    const results: Array<{
      tenant: any;
      subscription: SubscriptionDoc;
      evaluation: SubscriptionAccessEvaluation;
    }> = [];

    const now = new Date();

    for (const tenantDoc of tenantsSnap.docs) {
      const tenantData = tenantDoc.data();
      const subSnap = await this.db.doc(firestorePaths.subscription(tenantDoc.id)).get();

      let sub: SubscriptionDoc;
      if (subSnap.exists) {
        sub = SubscriptionDocSchema.parse(subSnap.data());
      } else {
        // Construct fallback placeholder if tenant lacks subscription document
        sub = {
          tenantId: tenantDoc.id,
          planId: tenantData.subscriptionTier || 'STARTER',
          status: 'EXPIRED',
          trialStartedAt: tenantData.createdAt || now.toISOString(),
          trialEndsAt: tenantData.createdAt || now.toISOString(),
          trialDurationDays: 3,
          currentPeriodStartedAt: null,
          currentPeriodEndsAt: null,
          activatedAt: null,
          activatedBy: null,
          lastActivationNote: null,
          createdAt: tenantData.createdAt || now.toISOString(),
          updatedAt: tenantData.updatedAt || now.toISOString(),
        };
      }

      const evaluation = evaluateSubscriptionStatus(sub, now);

      // Status filter
      if (filter?.status) {
        if (evaluation.effectiveStatus !== filter.status && sub.status !== filter.status) {
          continue;
        }
      }

      // Search filter
      if (filter?.search) {
        const query = filter.search.toLowerCase().trim();
        const matchesName = tenantData.name?.toLowerCase().includes(query);
        const matchesCommercial = tenantData.commercialName?.toLowerCase().includes(query);
        const matchesSlug = tenantData.slug?.toLowerCase().includes(query);
        if (!matchesName && !matchesCommercial && !matchesSlug) {
          continue;
        }
      }

      results.push({
        tenant: {
          id: tenantDoc.id,
          name: tenantData.name,
          commercialName: tenantData.commercialName,
          slug: tenantData.slug,
          status: tenantData.status,
          primaryOwnerUid: tenantData.primaryOwnerUid,
          createdAt: tenantData.createdAt,
        },
        subscription: sub,
        evaluation,
      });
    }

    return results;
  }
}

