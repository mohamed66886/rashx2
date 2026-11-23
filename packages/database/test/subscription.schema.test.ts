import { describe, it, expect } from 'vitest';
import {
  SubscriptionDocSchema,
  SubscriptionStatusEnum,
  SubscriptionAuditDocSchema,
  evaluateSubscriptionStatus,
  type SubscriptionDoc,
} from '../src/subscription.schema';

describe('B.2.8 Subscription Data Model & Evaluation Suite', () => {
  const baseStarted = '2026-11-23T10:00:00.000Z';
  const baseEnds = '2026-11-26T10:00:00.000Z'; // exactly 72 hours later

  const validTrialSub: SubscriptionDoc = {
    tenantId: 'tenant_salon_01',
    planId: 'STARTER',
    status: 'TRIALING',
    trialStartedAt: baseStarted,
    trialEndsAt: baseEnds,
    trialDurationDays: 3,
    currentPeriodStartedAt: null,
    currentPeriodEndsAt: null,
    activatedAt: null,
    activatedBy: null,
    lastActivationNote: null,
    createdAt: baseStarted,
    updatedAt: baseStarted,
  };

  it('validates a conformant 3-day TRIALING subscription document', () => {
    const parsed = SubscriptionDocSchema.parse(validTrialSub);
    expect(parsed.status).toBe('TRIALING');
    expect(parsed.trialDurationDays).toBe(3);
    expect(parsed.currentPeriodEndsAt).toBeNull();
  });

  it('rejects invalid subscription statuses', () => {
    expect(() =>
      SubscriptionDocSchema.parse({
        ...validTrialSub,
        status: 'UNLIMITED_FREE',
      })
    ).toThrow();
  });

  it('evaluates TRIALING status as allowed before expiration using server time', () => {
    // 24 hours into the trial
    const serverTime = new Date('2026-11-24T10:00:00.000Z');
    const result = evaluateSubscriptionStatus(validTrialSub, serverTime);

    expect(result.allowed).toBe(true);
    expect(result.effectiveStatus).toBe('TRIALING');
    expect(result.isTrial).toBe(true);
    expect(result.isExpired).toBe(false);
    expect(result.remainingTrialHours).toBe(48);
    expect(result.reason).toBe('TRIAL_ACTIVE');
  });

  it('evaluates TRIALING status as EXPIRED exactly at expiration moment', () => {
    // Exactly at 72 hours
    const serverTime = new Date(baseEnds);
    const result = evaluateSubscriptionStatus(validTrialSub, serverTime);

    expect(result.allowed).toBe(false);
    expect(result.effectiveStatus).toBe('EXPIRED');
    expect(result.isTrial).toBe(true);
    expect(result.isExpired).toBe(true);
    expect(result.remainingTrialHours).toBe(0);
    expect(result.reason).toBe('TRIAL_EXPIRED');
  });

  it('evaluates TRIALING status as EXPIRED after expiration has elapsed', () => {
    // 1 second after 72 hours
    const serverTime = new Date('2026-11-26T10:00:01.000Z');
    const result = evaluateSubscriptionStatus(validTrialSub, serverTime);

    expect(result.allowed).toBe(false);
    expect(result.effectiveStatus).toBe('EXPIRED');
    expect(result.isExpired).toBe(true);
    expect(result.reason).toBe('TRIAL_EXPIRED');
  });

  it('evaluates ACTIVE subscription with paid period as allowed within period', () => {
    const activeSub: SubscriptionDoc = {
      ...validTrialSub,
      status: 'ACTIVE',
      currentPeriodStartedAt: '2026-11-26T10:00:00.000Z',
      currentPeriodEndsAt: '2026-12-26T10:00:00.000Z', // 30 days
      activatedAt: '2026-11-26T10:00:00.000Z',
      activatedBy: 'admin_uid_999',
      lastActivationNote: 'Approved annual contract',
    };

    const serverTime = new Date('2026-12-01T12:00:00.000Z');
    const result = evaluateSubscriptionStatus(activeSub, serverTime);

    expect(result.allowed).toBe(true);
    expect(result.effectiveStatus).toBe('ACTIVE');
    expect(result.isTrial).toBe(false);
    expect(result.isExpired).toBe(false);
    expect(result.reason).toBe('PAID_ACTIVE');
  });

  it('evaluates ACTIVE subscription as EXPIRED once current period ends', () => {
    const activeSub: SubscriptionDoc = {
      ...validTrialSub,
      status: 'ACTIVE',
      currentPeriodStartedAt: '2026-11-26T10:00:00.000Z',
      currentPeriodEndsAt: '2026-12-26T10:00:00.000Z',
      activatedAt: '2026-11-26T10:00:00.000Z',
      activatedBy: 'admin_uid_999',
    };

    const serverTime = new Date('2026-12-27T00:00:00.000Z');
    const result = evaluateSubscriptionStatus(activeSub, serverTime);

    expect(result.allowed).toBe(false);
    expect(result.effectiveStatus).toBe('EXPIRED');
    expect(result.isExpired).toBe(true);
    expect(result.reason).toBe('PERIOD_EXPIRED');
  });

  it('evaluates SUSPENDED or CANCELED subscriptions as disallowed regardless of time', () => {
    const suspendedSub: SubscriptionDoc = {
      ...validTrialSub,
      status: 'SUSPENDED',
    };

    const result = evaluateSubscriptionStatus(suspendedSub, new Date('2026-11-24T10:00:00.000Z'));
    expect(result.allowed).toBe(false);
    expect(result.effectiveStatus).toBe('SUSPENDED');
  });

  it('validates audit document schema correctly', () => {
    const auditRecord = SubscriptionAuditDocSchema.parse({
      id: 'audit_123',
      tenantId: 'tenant_salon_01',
      action: 'MANUALLY_ACTIVATED',
      actorUid: 'admin_007',
      previousStatus: 'TRIALING',
      newStatus: 'ACTIVE',
      durationDays: 30,
      note: 'Payment confirmed via invoice #1002',
      timestamp: '2026-11-26T10:00:00.000Z',
    });

    expect(auditRecord.action).toBe('MANUALLY_ACTIVATED');
    expect(auditRecord.durationDays).toBe(30);
  });
});
