import 'server-only';
import type { firestore } from 'firebase-admin';
import {
  SubscriptionRepository,
  SubscriptionAccessError,
} from './repositories/subscription.repository';
import type { SubscriptionAccessEvaluation, SubscriptionDoc } from '../subscription.schema';

export interface GuardOperationalAccessResult {
  allowed: boolean;
  tenantId: string;
  subscription: SubscriptionDoc | null;
  evaluation: SubscriptionAccessEvaluation;
}

/**
 * Server-only Subscription Access Guard
 *
 * Verifies that a tenant has an operational subscription (TRIALING before 72hr expiry or ACTIVE paid period).
 * Rejects expired, suspended, or canceled subscriptions.
 */
export class SubscriptionAccessGuard {
  private readonly subscriptionRepo: SubscriptionRepository;

  constructor(private readonly db: firestore.Firestore) {
    this.subscriptionRepo = new SubscriptionRepository(db);
  }

  /**
   * Asserts operational access. Throws typed SubscriptionAccessError if subscription is not active.
   */
  async assertOperationalAccess(
    tenantId: string,
    serverTime: Date = new Date()
  ): Promise<SubscriptionAccessEvaluation> {
    const cleanTenantId = tenantId.trim();
    const evaluation = await this.subscriptionRepo.verifyOperationalAccess(cleanTenantId, serverTime);

    if (!evaluation.allowed) {
      throw new SubscriptionAccessError(
        evaluation,
        evaluation.isExpired
          ? 'انتهت فترة التجربة المجانية (3 أيام) لهذا الصالون. يلزم الاشتراك للاستمرار.'
          : `الوصول التشغيلي مقيد: حالة الاشتراك الحالية (${evaluation.effectiveStatus}) لا تسمح بالعمليات.`
      );
    }

    return evaluation;
  }

  /**
   * Checks operational access without throwing, returning a typed evaluation.
   */
  async checkOperationalAccess(
    tenantId: string,
    serverTime: Date = new Date()
  ): Promise<GuardOperationalAccessResult> {
    const cleanTenantId = tenantId.trim();
    const subscription = await this.subscriptionRepo.getSubscription(cleanTenantId);
    const evaluation = await this.subscriptionRepo.verifyOperationalAccess(cleanTenantId, serverTime);

    return {
      allowed: evaluation.allowed,
      tenantId: cleanTenantId,
      subscription,
      evaluation,
    };
  }
}
