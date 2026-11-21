import { describe, it, expect } from 'vitest';
import {
  AppointmentDocSchema,
  RescheduleAppointmentInputSchema,
  normalizeToUtcIso,
  type AppointmentDoc,
} from '../src/appointment.schema';

describe('Appointment Schema & Canonical Datetime Integrity', () => {
  const validAppointment: AppointmentDoc = {
    id: 'apt_123',
    tenantId: 'tenant_salon_alpha',
    branchId: 'branch_olaya',
    staffId: 'uid_staff_tariq',
    customerId: 'uid_cust_sara',
    serviceId: 'srv_haircut_royal',
    status: 'CONFIRMED',
    scheduledStartTime: '2026-11-25T10:00:00.000Z',
    scheduledEndTime: '2026-11-25T11:00:00.000Z',
    priceHalalas: 15000,
    paymentStatus: 'PAID',
    notes: 'Client prefers herbal tea',
    createdAt: '2026-11-20T20:00:00.000Z',
    updatedAt: '2026-11-20T20:00:00.000Z',
  };

  describe('normalizeToUtcIso', () => {
    it('normalizes UTC string ending in Z', () => {
      expect(normalizeToUtcIso('2026-11-25T10:00:00.000Z')).toBe('2026-11-25T10:00:00.000Z');
      expect(normalizeToUtcIso('2026-11-25T10:00:00Z')).toBe('2026-11-25T10:00:00.000Z');
    });

    it('normalizes timezone offsets to UTC ISO instant (+03:00 for Riyadh)', () => {
      // 13:00 in UTC+3 is exactly 10:00 in UTC
      const normalized = normalizeToUtcIso('2026-11-25T13:00:00+03:00');
      expect(normalized).toBe('2026-11-25T10:00:00.000Z');
    });

    it('confirms equivalent instants across different timezones match canonically', () => {
      const utcInstant = normalizeToUtcIso('2026-11-25T10:00:00Z');
      const riyadhInstant = normalizeToUtcIso('2026-11-25T13:00:00+03:00');
      const londonInstant = normalizeToUtcIso('2026-11-25T10:00:00+00:00');
      const nyInstant = normalizeToUtcIso('2026-11-25T05:00:00-05:00');

      expect(riyadhInstant).toBe(utcInstant);
      expect(londonInstant).toBe(utcInstant);
      expect(nyInstant).toBe(utcInstant);
    });

    it('rejects invalid datetime strings', () => {
      expect(() => normalizeToUtcIso('not-a-date')).toThrow(/Invalid ISO 8601 datetime/);
      expect(() => normalizeToUtcIso('')).toThrow(/must be non-empty/);
    });
  });

  describe('AppointmentDocSchema', () => {
    it('validates a complete, canonical appointment document', () => {
      const parsed = AppointmentDocSchema.parse(validAppointment);
      expect(parsed.id).toBe('apt_123');
      expect(parsed.priceHalalas).toBe(15000);
      expect(parsed.paymentStatus).toBe('PAID');
    });

    it('rejects appointment when scheduledEndTime is before scheduledStartTime', () => {
      expect(() =>
        AppointmentDocSchema.parse({
          ...validAppointment,
          scheduledStartTime: '2026-11-25T12:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
        })
      ).toThrow(/scheduledEndTime must be strictly later than scheduledStartTime/);
    });

    it('rejects appointment when scheduledEndTime equals scheduledStartTime', () => {
      expect(() =>
        AppointmentDocSchema.parse({
          ...validAppointment,
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T10:00:00.000Z',
        })
      ).toThrow(/scheduledEndTime must be strictly later than scheduledStartTime/);
    });

    it('rejects negative price in Halalas', () => {
      expect(() =>
        AppointmentDocSchema.parse({
          ...validAppointment,
          priceHalalas: -100,
        })
      ).toThrow(/cannot be negative/);
    });

    it('rejects unrecognized keys (fail closed)', () => {
      expect(() =>
        AppointmentDocSchema.parse({
          ...validAppointment,
          extraField: 'unauthorized',
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('RescheduleAppointmentInputSchema', () => {
    it('validates valid reschedule payload with offset', () => {
      const input = {
        tenantId: 'tenant_salon_alpha',
        appointmentId: 'apt_123',
        scheduledStartTime: '2026-11-25T14:00:00+03:00',
        scheduledEndTime: '2026-11-25T15:00:00+03:00',
        staffId: 'uid_staff_layla',
        notes: 'Rescheduled upon customer request',
      };
      const parsed = RescheduleAppointmentInputSchema.parse(input);
      expect(parsed.tenantId).toBe('tenant_salon_alpha');
      expect(parsed.staffId).toBe('uid_staff_layla');
    });

    it('rejects reschedule payload when end is before start', () => {
      const input = {
        tenantId: 'tenant_salon_alpha',
        appointmentId: 'apt_123',
        scheduledStartTime: '2026-11-25T16:00:00+03:00',
        scheduledEndTime: '2026-11-25T15:00:00+03:00',
      };
      expect(() => RescheduleAppointmentInputSchema.parse(input)).toThrow(
        /scheduledEndTime must be strictly later than scheduledStartTime/
      );
    });
  });
});

