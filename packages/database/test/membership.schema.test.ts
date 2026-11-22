import { describe, it, expect } from 'vitest';
import {
  MembershipDocSchema,
  MembershipSummaryDocSchema,
  CreateMembershipInputSchema,
  UpdateMembershipRoleInputSchema,
  type MembershipDoc,
  type MembershipSummaryDoc,
} from '../src/membership.schema';

describe('Membership Schema & Invariant Enforcement', () => {
  const validMember: MembershipDoc = {
    id: 'firebase_auth_uid_100',
    tenantId: 'tenant_riyadh_01',
    role: 'OWNER',
    status: 'ACTIVE',
    title: 'Managing Director',
    joinedAt: '2026-11-20T20:00:00.000Z',
    updatedAt: '2026-11-20T20:00:00.000Z',
  };

  describe('MembershipDocSchema', () => {
    it('validates a valid membership document', () => {
      const parsed = MembershipDocSchema.parse(validMember);
      expect(parsed.id).toBe('firebase_auth_uid_100');
      expect(parsed.role).toBe('OWNER');
      expect(parsed.status).toBe('ACTIVE');
    });

    it('rejects invalid roles', () => {
      expect(() =>
        MembershipDocSchema.parse({
          ...validMember,
          role: 'SUPERADMIN',
        })
      ).toThrow();
    });

    it('rejects invalid statuses', () => {
      expect(() =>
        MembershipDocSchema.parse({
          ...validMember,
          status: 'PENDING_CONFIRMATION',
        })
      ).toThrow();
    });

    it('strictly fails closed on unexpected keys', () => {
      expect(() =>
        MembershipDocSchema.parse({
          ...validMember,
          isAdminOverride: true,
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('MembershipSummaryDocSchema (Owner Mutex Invariant)', () => {
    const validSummary: MembershipSummaryDoc = {
      tenantId: 'tenant_riyadh_01',
      activeOwnerCount: 1,
      totalActiveMembers: 5,
      version: 0,
      updatedAt: '2026-11-20T20:00:00.000Z',
    };

    it('validates a correct membership summary document', () => {
      const parsed = MembershipSummaryDocSchema.parse(validSummary);
      expect(parsed.activeOwnerCount).toBe(1);
      expect(parsed.totalActiveMembers).toBe(5);
      expect(parsed.version).toBe(0);
    });

    it('CRITICAL: Rejects activeOwnerCount < 1 (prevents orphaned tenants)', () => {
      expect(() =>
        MembershipSummaryDocSchema.parse({
          ...validSummary,
          activeOwnerCount: 0,
        })
      ).toThrow(/at least 1 active owner/);

      expect(() =>
        MembershipSummaryDocSchema.parse({
          ...validSummary,
          activeOwnerCount: -1,
        })
      ).toThrow(/at least 1 active owner/);
    });

    it('rejects non-integer activeOwnerCount', () => {
      expect(() =>
        MembershipSummaryDocSchema.parse({
          ...validSummary,
          activeOwnerCount: 1.5,
        })
      ).toThrow(/must be an integer/);
    });

    it('rejects negative version numbers', () => {
      expect(() =>
        MembershipSummaryDocSchema.parse({
          ...validSummary,
          version: -1,
        })
      ).toThrow(/must be non-negative/);
    });

    it('fails closed on unrecognized keys', () => {
      expect(() =>
        MembershipSummaryDocSchema.parse({
          ...validSummary,
          cachedRoleList: ['OWNER'],
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('CreateMembershipInputSchema & UpdateMembershipRoleInputSchema', () => {
    it('validates creation input', () => {
      const input = {
        id: 'auth_uid_new_staff',
        tenantId: 'tenant_riyadh_01',
        role: 'STAFF' as const,
        title: 'Senior Stylist',
      };
      const parsed = CreateMembershipInputSchema.parse(input);
      expect(parsed.role).toBe('STAFF');
    });

    it('validates role update input', () => {
      const input = {
        role: 'MANAGER' as const,
        status: 'ACTIVE' as const,
      };
      const parsed = UpdateMembershipRoleInputSchema.parse(input);
      expect(parsed.role).toBe('MANAGER');
    });
  });
});

