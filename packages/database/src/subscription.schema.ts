import { z } from 'zod';
import { SubscriptionTierEnum } from './tenant.schema';

/**
 * Authoritative RASHX Subscription Status Model
 *
 * Distinct from tenant operational lifecycle (`tenant.status` e.g. ACTIVE, SUSPENDED).
 * - TRIALING: Newly provisioned salon within its 72-hour trial period.
 * - PENDING_ACTIVATION: Awaiting platform admin review or confirmation.
 * - ACTIVE: Formally confirmed and active for a paid/contracted duration.
 * - EXPIRED: Trial or paid period has elapsed (now >= trialEndsAt / currentPeriodEndsAt).
 * - SUSPENDED: Administrative restriction imposed by platform operators.
 * - CANCELED: Subscription voluntarily terminated.
 */
export const SubscriptionStatusEnum = z.enum([
  'TRIALING',
  'PENDING_ACTIVATION',
  'ACTIVE',
  'EXPIRED',
  'SUSPENDED',
  'CANCELED',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

/**
 * Plan identifier (aligned with existing SubscriptionTierEnum with extensible string support)
 */
export const SubscriptionPlanIdSchema = z.string().min(1).default('STARTER');

/**
 * Authoritative Canonical Subscription Document Schema (`/tenants/{tenantId}/subscription/record`)
 */
export const SubscriptionDocSchema = z.object({
  tenantId: z.string().min(1, 'tenantId must be non-empty'),
  planId: SubscriptionPlanIdSchema,
  status: SubscriptionStatusEnum,
  trialStartedAt: z.string().datetime({ message: 'trialStartedAt must be an ISO 8601 string' }),
  trialEndsAt: z.string().datetime({ message: 'trialEndsAt must be an ISO 8601 string' }),
  trialDurationDays: z.number().int().positive().default(3),
  currentPeriodStartedAt: z
    .string()
    .datetime({ message: 'currentPeriodStartedAt must be an ISO 8601 string' })
    .nullable()
    .default(null),
  currentPeriodEndsAt: z
    .string()
    .datetime({ message: 'currentPeriodEndsAt must be an ISO 8601 string' })
    .nullable()
    .default(null),
  activatedAt: z
    .string()
    .datetime({ message: 'activatedAt must be an ISO 8601 string' })
    .nullable()
    .default(null),
  activatedBy: z.string().nullable().default(null),
  lastActivationNote: z.string().nullable().default(null),
  createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
  updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
});
export type SubscriptionDoc = z.infer<typeof SubscriptionDocSchema>;

/**
 * Subscription Audit Action Types
 */
export const SubscriptionAuditActionEnum = z.enum([
  'TRIAL_CREATED',
  'MANUALLY_ACTIVATED',
  'SUSPENDED',
  'REACTIVATED',
  'AUTO_EXPIRED',
  'CANCELED',
]);
export type SubscriptionAuditAction = z.infer<typeof SubscriptionAuditActionEnum>;

/**
 * Privileged Subscription Audit Log Document Schema (`/tenants/{tenantId}/subscription_audit/{auditId}`)
 * Strictly accessible to platform administrators only.
 */
export const SubscriptionAuditDocSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  action: SubscriptionAuditActionEnum,
  actorUid: z.string().min(1),
  previousStatus: SubscriptionStatusEnum,
  newStatus: SubscriptionStatusEnum,
  periodStartedAt: z.string().datetime().nullable().optional(),
  periodEndsAt: z.string().datetime().nullable().optional(),
  durationDays: z.number().int().positive().nullable().optional(),
  note: z.string().nullable().optional(),
  timestamp: z.string().datetime(),
});
export type SubscriptionAuditDoc = z.infer<typeof SubscriptionAuditDocSchema>;

/**
 * Evaluated Subscription Access Result
 */
export interface SubscriptionAccessEvaluation {
  allowed: boolean;
  effectiveStatus: SubscriptionStatus;
  isTrial: boolean;
  isExpired: boolean;
  remainingTrialMs: number;
  remainingTrialHours: number;
  trialEndsAt: string;
  currentPeriodEndsAt: string | null;
  planId: string;
  reason?:
    | 'TRIAL_ACTIVE'
    | 'PAID_ACTIVE'
    | 'TRIAL_EXPIRED'
    | 'PERIOD_EXPIRED'
    | 'SUSPENDED'
    | 'CANCELED'
    | 'PENDING_ACTIVATION'
    | 'NO_SUBSCRIPTION';
}

/**
 * Evaluates subscription status against authoritative server time.
 * Client clocks cannot influence the outcome.
 */
export function evaluateSubscriptionStatus(
  subscription: SubscriptionDoc | null | undefined,
  serverTime: Date = new Date()
): SubscriptionAccessEvaluation {
  if (!subscription) {
    return {
      allowed: false,
      effectiveStatus: 'EXPIRED',
      isTrial: false,
      isExpired: true,
      remainingTrialMs: 0,
      remainingTrialHours: 0,
      trialEndsAt: new Date(0).toISOString(),
      currentPeriodEndsAt: null,
      planId: 'STARTER',
      reason: 'NO_SUBSCRIPTION',
    };
  }

  const nowMs = serverTime.getTime();
  const trialEndsMs = new Date(subscription.trialEndsAt).getTime();
  const remainingTrialMs = Math.max(0, trialEndsMs - nowMs);
  const remainingTrialHours = Math.floor(remainingTrialMs / (1000 * 60 * 60));

  // 1. TRIALING status evaluation
  if (subscription.status === 'TRIALING') {
    if (nowMs >= trialEndsMs) {
      return {
        allowed: false,
        effectiveStatus: 'EXPIRED',
        isTrial: true,
        isExpired: true,
        remainingTrialMs: 0,
        remainingTrialHours: 0,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEndsAt: subscription.currentPeriodEndsAt,
        planId: subscription.planId,
        reason: 'TRIAL_EXPIRED',
      };
    }

    return {
      allowed: true,
      effectiveStatus: 'TRIALING',
      isTrial: true,
      isExpired: false,
      remainingTrialMs,
      remainingTrialHours,
      trialEndsAt: subscription.trialEndsAt,
      currentPeriodEndsAt: subscription.currentPeriodEndsAt,
      planId: subscription.planId,
      reason: 'TRIAL_ACTIVE',
    };
  }

  // 2. ACTIVE status evaluation (paid / administrator-activated period)
  if (subscription.status === 'ACTIVE') {
    if (subscription.currentPeriodEndsAt) {
      const periodEndsMs = new Date(subscription.currentPeriodEndsAt).getTime();
      if (nowMs >= periodEndsMs) {
        return {
          allowed: false,
          effectiveStatus: 'EXPIRED',
          isTrial: false,
          isExpired: true,
          remainingTrialMs: 0,
          remainingTrialHours: 0,
          trialEndsAt: subscription.trialEndsAt,
          currentPeriodEndsAt: subscription.currentPeriodEndsAt,
          planId: subscription.planId,
          reason: 'PERIOD_EXPIRED',
        };
      }
    }

    return {
      allowed: true,
      effectiveStatus: 'ACTIVE',
      isTrial: false,
      isExpired: false,
      remainingTrialMs: 0,
      remainingTrialHours: 0,
      trialEndsAt: subscription.trialEndsAt,
      currentPeriodEndsAt: subscription.currentPeriodEndsAt,
      planId: subscription.planId,
      reason: 'PAID_ACTIVE',
    };
  }

  // 3. Terminal or restricted states: EXPIRED, SUSPENDED, CANCELED, PENDING_ACTIVATION
  return {
    allowed: false,
    effectiveStatus: subscription.status,
    isTrial: false,
    isExpired: subscription.status === 'EXPIRED',
    remainingTrialMs: 0,
    remainingTrialHours: 0,
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodEndsAt: subscription.currentPeriodEndsAt,
    planId: subscription.planId,
    reason: subscription.status as any,
  };
}

