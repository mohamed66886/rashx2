import { describe, it, expect } from 'vitest';
import {
  StaffDocSchema,
  StaffCompensationDocSchema,
  StaffConfidentialDocSchema,
  PublicStaffRosterSchema,
  CreateStaffInputSchema,
  UpdateStaffInputSchema,
  type StaffDoc,
} from '../src/staff.schema';

describe('Staff Schema & PII/Compensation Boundary Verification', () => {
  const validStaffDoc: StaffDoc = {
    id: 'auth_uid_stylist_sara',
    tenantId: 'tenant_riyadh_01',
    displayName: 'Sara Al-Otaibi',
    assignedBranchIds: ['branch_olaya_main'],
    isActive: true,
    isPubliclyVisible: true,
    specialties: ['Hair Styling', 'Balayage Color', 'Keratin Treatment'],
    baseSalaryHalalas: 850000, // 8,500.00 SAR
    commissionSplitBps: 1500, // 15.00%
    nationalId: '1087654321', // Sensitive Saudi National ID
    personalPhone: '+966501234567', // Confidential mobile
    emergencyContact: 'Fahad Al-Otaibi (Brother) +966507654321', // PII
    employmentStatus: 'FULL_TIME',
    createdAt: '2026-11-20T20:00:00.000Z',
    updatedAt: '2026-11-20T21:00:00.000Z',
  };

  describe('StaffDocSchema (Operational Record)', () => {
    it('validates a complete operational staff document', () => {
      const parsed = StaffDocSchema.parse(validStaffDoc);
      expect(parsed.id).toBe('auth_uid_stylist_sara');
      expect(parsed.baseSalaryHalalas).toBe(850000);
      expect(parsed.commissionSplitBps).toBe(1500);
      expect(parsed.nationalId).toBe('1087654321');
    });

    it('rejects negative salary in Halalas', () => {
      expect(() =>
        StaffDocSchema.parse({
          ...validStaffDoc,
          baseSalaryHalalas: -500,
        })
      ).toThrow(/cannot be negative/);
    });

    it('rejects non-integer salary in Halalas', () => {
      expect(() =>
        StaffDocSchema.parse({
          ...validStaffDoc,
          baseSalaryHalalas: 8500.5,
        })
      ).toThrow(/must be an integer/);
    });

    it('rejects commissionSplitBps greater than 10000 (100%)', () => {
      expect(() =>
        StaffDocSchema.parse({
          ...validStaffDoc,
          commissionSplitBps: 10001,
        })
      ).toThrow(/cannot exceed 10000/);
    });

    it('rejects negative commissionSplitBps', () => {
      expect(() =>
        StaffDocSchema.parse({
          ...validStaffDoc,
          commissionSplitBps: -100,
        })
      ).toThrow(/cannot be negative/);
    });

    it('rejects staff without at least one assigned branch', () => {
      expect(() =>
        StaffDocSchema.parse({
          ...validStaffDoc,
          assignedBranchIds: [],
        })
      ).toThrow(/at least one branch/);
    });

    it('fails closed on unrecognized keys', () => {
      expect(() =>
        StaffDocSchema.parse({
          ...validStaffDoc,
          extraPerks: 'Company car',
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('PublicStaffRosterSchema & Sensitive Data Exclusion', () => {
    const validPublicStaff = {
      id: 'auth_uid_stylist_sara',
      displayName: 'Sara Al-Otaibi',
      avatarUrl: 'https://cdn.rashx.com/avatars/sara.jpg',
      bio: 'Senior colorist with 8 years of luxury salon experience.',
      specialties: ['Hair Styling', 'Balayage Color', 'Keratin Treatment'],
      assignedBranchIds: ['branch_olaya_main'],
      isBookableOnline: true,
    };

    it('validates a clean public staff roster projection', () => {
      const parsed = PublicStaffRosterSchema.parse(validPublicStaff);
      expect(parsed.id).toBe('auth_uid_stylist_sara');
      expect(parsed.displayName).toBe('Sara Al-Otaibi');
      expect(parsed.specialties).toHaveLength(3);
    });

    it('CRITICAL: Strictly fails when operational document is parsed as public roster', () => {
      // Must throw because operational record contains baseSalaryHalalas, nationalId,
      // personalPhone, emergencyContact, commissionSplitBps, etc.
      expect(() => PublicStaffRosterSchema.parse(validStaffDoc)).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects baseSalaryHalalas in public projection', () => {
      expect(() =>
        PublicStaffRosterSchema.parse({
          ...validPublicStaff,
          baseSalaryHalalas: 850000,
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects commissionSplitBps in public projection', () => {
      expect(() =>
        PublicStaffRosterSchema.parse({
          ...validPublicStaff,
          commissionSplitBps: 1500,
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects nationalId in public projection', () => {
      expect(() =>
        PublicStaffRosterSchema.parse({
          ...validPublicStaff,
          nationalId: '1087654321',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects personalPhone in public projection', () => {
      expect(() =>
        PublicStaffRosterSchema.parse({
          ...validPublicStaff,
          personalPhone: '+966501234567',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects emergencyContact in public projection', () => {
      expect(() =>
        PublicStaffRosterSchema.parse({
          ...validPublicStaff,
          emergencyContact: 'Fahad Al-Otaibi',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects tenantId in public projection', () => {
      expect(() =>
        PublicStaffRosterSchema.parse({
          ...validPublicStaff,
          tenantId: 'tenant_riyadh_01',
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('CreateStaffInputSchema & UpdateStaffInputSchema', () => {
    it('validates staff creation with operational defaults', () => {
      const input = {
        id: 'auth_uid_new_joiner',
        tenantId: 'tenant_riyadh_01',
        displayName: 'Noura Salem',
        assignedBranchIds: ['branch_olaya_main'],
        nationalId: '1099887766',
        personalPhone: '+966551122334',
        emergencyContact: 'Mother: +966559988776',
      };
      const parsed = CreateStaffInputSchema.parse(input);
      expect(parsed.baseSalaryHalalas).toBe(0);
      expect(parsed.commissionSplitBps).toBe(0);
      expect(parsed.employmentStatus).toBe('FULL_TIME');
      expect(parsed.isPubliclyVisible).toBe(true);
    });

    it('validates partial staff updates strictly', () => {
      const update = {
        baseSalaryHalalas: 900000,
        commissionSplitBps: 2000,
      };
      const parsed = UpdateStaffInputSchema.parse(update);
      expect(parsed.baseSalaryHalalas).toBe(900000);
      expect(parsed.commissionSplitBps).toBe(2000);
    });
  });

  describe('StaffCompensationDocSchema & StaffConfidentialDocSchema Separation', () => {
    it('validates staff self-service compensation projection document', () => {
      const compDoc = {
        id: 'auth_uid_stylist_sara',
        tenantId: 'tenant_riyadh_01',
        staffId: 'auth_uid_stylist_sara',
        baseSalaryHalalas: 850000,
        commissionSplitBps: 1500,
        employmentStatus: 'FULL_TIME' as const,
        createdAt: '2026-11-20T20:00:00.000Z',
        updatedAt: '2026-11-20T21:00:00.000Z',
      };
      const parsed = StaffCompensationDocSchema.parse(compDoc);
      expect(parsed.baseSalaryHalalas).toBe(850000);
      expect(parsed.commissionSplitBps).toBe(1500);
    });

    it('rejects PII in staff compensation projection document', () => {
      const invalidCompDoc = {
        id: 'auth_uid_stylist_sara',
        tenantId: 'tenant_riyadh_01',
        staffId: 'auth_uid_stylist_sara',
        baseSalaryHalalas: 850000,
        commissionSplitBps: 1500,
        employmentStatus: 'FULL_TIME',
        nationalId: '1087654321', // Sensitive PII must not leak into compensation
        createdAt: '2026-11-20T20:00:00.000Z',
        updatedAt: '2026-11-20T21:00:00.000Z',
      };
      expect(() => StaffCompensationDocSchema.parse(invalidCompDoc)).toThrow(/unrecognized_keys/);
    });

    it('validates confidential HR identity and emergency document', () => {
      const confDoc = {
        id: 'auth_uid_stylist_sara',
        tenantId: 'tenant_riyadh_01',
        staffId: 'auth_uid_stylist_sara',
        nationalId: '1087654321',
        personalPhone: '+966501234567',
        emergencyContact: 'Fahad Al-Otaibi (Brother) +966507654321',
        createdAt: '2026-11-20T20:00:00.000Z',
        updatedAt: '2026-11-20T21:00:00.000Z',
      };
      const parsed = StaffConfidentialDocSchema.parse(confDoc);
      expect(parsed.nationalId).toBe('1087654321');
      expect(parsed.personalPhone).toBe('+966501234567');
    });

    it('rejects compensation data in confidential HR identity document', () => {
      const invalidConfDoc = {
        id: 'auth_uid_stylist_sara',
        tenantId: 'tenant_riyadh_01',
        staffId: 'auth_uid_stylist_sara',
        nationalId: '1087654321',
        personalPhone: '+966501234567',
        emergencyContact: 'Fahad Al-Otaibi',
        baseSalaryHalalas: 850000, // Compensation must not leak into HR doc
        createdAt: '2026-11-20T20:00:00.000Z',
        updatedAt: '2026-11-20T21:00:00.000Z',
      };
      expect(() => StaffConfidentialDocSchema.parse(invalidConfDoc)).toThrow(/unrecognized_keys/);
    });
  });
});

