import { describe, it, expect } from 'vitest';
import {
  BranchDocSchema,
  PublicBranchSchema,
  GeoCoordinatesSchema,
  OperatingHoursWeeklySchema,
  CreateBranchInputSchema,
  UpdateBranchInputSchema,
  type BranchDoc,
} from '../src/branch.schema';

describe('Branch Schema & Coordinate/Schedule Validation', () => {
  const standardHours = {
    open: '09:00',
    close: '21:00',
    isClosed: false,
  };

  const weeklySchedule = {
    monday: standardHours,
    tuesday: standardHours,
    wednesday: standardHours,
    thursday: standardHours,
    friday: { open: '13:00', close: '22:00', isClosed: false },
    saturday: standardHours,
    sunday: { open: '00:00', close: '00:00', isClosed: true },
  };

  const validBranchDoc: BranchDoc = {
    id: 'branch_olaya_main',
    tenantId: 'tenant_riyadh_01',
    name: 'Al-Olaya Flagship Branch',
    city: 'Riyadh',
    district: 'Al-Olaya',
    address: 'King Fahd Road, Building 42',
    coordinates: {
      latitude: 24.7136,
      longitude: 46.6753,
    },
    phone: '+966112345678',
    isActive: true,
    operatingHours: weeklySchedule,
    internalNotes: 'Alarm code #4041. Landlord contact Mr. Khalid.',
    createdAt: '2026-11-20T20:00:00.000Z',
    updatedAt: '2026-11-20T21:00:00.000Z',
  };

  describe('GeoCoordinatesSchema', () => {
    it('accepts valid WGS 84 coordinates in Saudi Arabia', () => {
      const coords = GeoCoordinatesSchema.parse({
        latitude: 24.7136,
        longitude: 46.6753,
      });
      expect(coords.latitude).toBe(24.7136);
      expect(coords.longitude).toBe(46.6753);
    });

    it('rejects out-of-range latitudes (< -90 or > 90)', () => {
      expect(() => GeoCoordinatesSchema.parse({ latitude: 90.0001, longitude: 46.0 })).toThrow();
      expect(() => GeoCoordinatesSchema.parse({ latitude: -90.0001, longitude: 46.0 })).toThrow();
    });

    it('rejects out-of-range longitudes (< -180 or > 180)', () => {
      expect(() => GeoCoordinatesSchema.parse({ latitude: 24.0, longitude: 180.001 })).toThrow();
      expect(() => GeoCoordinatesSchema.parse({ latitude: 24.0, longitude: -180.001 })).toThrow();
    });

    it('fails closed on extra coordinate keys', () => {
      expect(() =>
        GeoCoordinatesSchema.parse({
          latitude: 24.0,
          longitude: 46.0,
          altitude: 600,
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('OperatingHoursWeeklySchema', () => {
    it('validates a complete 7-day schedule', () => {
      const parsed = OperatingHoursWeeklySchema.parse(weeklySchedule);
      expect(parsed.friday.open).toBe('13:00');
      expect(parsed.sunday.isClosed).toBe(true);
    });

    it('rejects invalid time formats (non-24h, invalid minutes)', () => {
      expect(() =>
        OperatingHoursWeeklySchema.parse({
          ...weeklySchedule,
          monday: { open: '9:00', close: '21:00', isClosed: false }, // missing leading zero
        })
      ).toThrow();

      expect(() =>
        OperatingHoursWeeklySchema.parse({
          ...weeklySchedule,
          monday: { open: '25:00', close: '21:00', isClosed: false }, // invalid hour
        })
      ).toThrow();

      expect(() =>
        OperatingHoursWeeklySchema.parse({
          ...weeklySchedule,
          monday: { open: '09:60', close: '21:00', isClosed: false }, // invalid minute
        })
      ).toThrow();
    });
  });

  describe('BranchDocSchema (Operational)', () => {
    it('validates a full operational branch document', () => {
      const parsed = BranchDocSchema.parse(validBranchDoc);
      expect(parsed.id).toBe('branch_olaya_main');
      expect(parsed.internalNotes).toBe('Alarm code #4041. Landlord contact Mr. Khalid.');
    });

    it('fails closed on unexpected keys', () => {
      expect(() =>
        BranchDocSchema.parse({
          ...validBranchDoc,
          unauthorizedField: 'malicious',
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('PublicBranchSchema & Sensitive Field Isolation', () => {
    const validPublicBranch = {
      id: 'branch_olaya_main',
      name: 'Al-Olaya Flagship Branch',
      city: 'Riyadh',
      district: 'Al-Olaya',
      address: 'King Fahd Road, Building 42',
      coordinates: {
        latitude: 24.7136,
        longitude: 46.6753,
      },
      phone: '+966112345678',
      operatingHours: weeklySchedule,
      isActive: true,
    };

    it('validates a public branch projection', () => {
      const parsed = PublicBranchSchema.parse(validPublicBranch);
      expect(parsed.id).toBe('branch_olaya_main');
      expect(parsed.city).toBe('Riyadh');
    });

    it('CRITICAL: Strictly fails when operational document is parsed as public projection', () => {
      // Must reject because operational document contains internalNotes and tenantId
      expect(() => PublicBranchSchema.parse(validBranchDoc)).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects internalNotes in public projection', () => {
      expect(() =>
        PublicBranchSchema.parse({
          ...validPublicBranch,
          internalNotes: 'Confidential staff note',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects tenantId in public projection', () => {
      expect(() =>
        PublicBranchSchema.parse({
          ...validPublicBranch,
          tenantId: 'tenant_riyadh_01',
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('CreateBranchInputSchema & UpdateBranchInputSchema', () => {
    it('validates branch creation input', () => {
      const input = {
        tenantId: 'tenant_riyadh_01',
        name: 'Sahafa Branch',
        city: 'Riyadh',
        district: 'Al-Sahafa',
        address: 'Olaya Street, Sahafa',
        coordinates: { latitude: 24.79, longitude: 46.65 },
        phone: '+966119876543',
        operatingHours: weeklySchedule,
      };
      const parsed = CreateBranchInputSchema.parse(input);
      expect(parsed.name).toBe('Sahafa Branch');
    });

    it('validates branch update input', () => {
      const update = {
        name: 'Renamed Sahafa Branch',
        isActive: false,
      };
      const parsed = UpdateBranchInputSchema.parse(update);
      expect(parsed.name).toBe('Renamed Sahafa Branch');
      expect(parsed.isActive).toBe(false);
    });
  });
});

