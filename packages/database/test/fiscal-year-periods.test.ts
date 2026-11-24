import { describe, it, expect } from 'vitest';
import { generateFiscalPeriods } from '../src/server/tenant-bootstrap.service';

describe('Fiscal Year & Accounting Period Boundaries Suite', () => {
  it('generates standard calendar-year periods (January through December)', () => {
    const result = generateFiscalPeriods(2026, 1);

    expect(result.fiscalStartDate).toBe('2026-01-01');
    expect(result.fiscalEndDate).toBe('2026-12-31');
    expect(result.periods.length).toBe(12);

    // Period 1: January
    expect(result.periods[0]?.id).toBe('2026-01');
    expect(result.periods[0]?.startDate).toBe('2026-01-01');
    expect(result.periods[0]?.endDate).toBe('2026-01-31');
    expect(result.periods[0]?.periodNumber).toBe(1);

    // Period 2: February (non-leap year 2026 -> 28 days)
    expect(result.periods[1]?.id).toBe('2026-02');
    expect(result.periods[1]?.startDate).toBe('2026-02-01');
    expect(result.periods[1]?.endDate).toBe('2026-02-28');

    // Period 12: December
    expect(result.periods[11]?.id).toBe('2026-12');
    expect(result.periods[11]?.startDate).toBe('2026-12-01');
    expect(result.periods[11]?.endDate).toBe('2026-12-31');
    expect(result.periods[11]?.periodNumber).toBe(12);
  });

  it('generates non-calendar fiscal year crossing two calendar years (e.g. April 1 - March 31)', () => {
    const result = generateFiscalPeriods(2026, 4);

    expect(result.fiscalStartDate).toBe('2026-04-01');
    expect(result.fiscalEndDate).toBe('2027-03-31');
    expect(result.periods.length).toBe(12);

    // Period 1: April 2026
    expect(result.periods[0]?.id).toBe('2026-04');
    expect(result.periods[0]?.startDate).toBe('2026-04-01');
    expect(result.periods[0]?.endDate).toBe('2026-04-30');

    // Period 9: December 2026
    expect(result.periods[8]?.id).toBe('2026-12');
    expect(result.periods[8]?.startDate).toBe('2026-12-01');
    expect(result.periods[8]?.endDate).toBe('2026-12-31');

    // Period 10: January 2027 (next year)
    expect(result.periods[9]?.id).toBe('2027-01');
    expect(result.periods[9]?.startDate).toBe('2027-01-01');
    expect(result.periods[9]?.endDate).toBe('2027-01-31');

    // Period 11: February 2027 (28 days)
    expect(result.periods[10]?.id).toBe('2027-02');
    expect(result.periods[10]?.startDate).toBe('2027-02-01');
    expect(result.periods[10]?.endDate).toBe('2027-02-28');

    // Period 12: March 2027
    expect(result.periods[11]?.id).toBe('2027-03');
    expect(result.periods[11]?.startDate).toBe('2027-03-01');
    expect(result.periods[11]?.endDate).toBe('2027-03-31');
  });

  it('accurately calculates leap year February (29 days in 2024 and 2028)', () => {
    // 2024 is a leap year
    const leap2024 = generateFiscalPeriods(2024, 1);
    const feb2024 = leap2024.periods.find((p) => p.id === '2024-02');
    expect(feb2024?.startDate).toBe('2024-02-01');
    expect(feb2024?.endDate).toBe('2024-02-29');

    // 2028 is a leap year (non-calendar starting in October 2027)
    const crossLeap = generateFiscalPeriods(2027, 10);
    const feb2028 = crossLeap.periods.find((p) => p.id === '2028-02');
    expect(feb2028?.startDate).toBe('2028-02-01');
    expect(feb2028?.endDate).toBe('2028-02-29');
  });

  it('ensures all 12 periods are completely contiguous with zero gaps and zero overlaps', () => {
    const result = generateFiscalPeriods(2025, 7); // July 2025 to June 2026

    for (let i = 0; i < result.periods.length - 1; i++) {
      const current = result.periods[i]!;
      const next = result.periods[i + 1]!;

      const currentEnd = new Date(current.endDate);
      const nextStart = new Date(next.startDate);

      // Next start day must be exactly 1 day after current end day
      const diffMs = nextStart.getTime() - currentEnd.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(1);
    }
  });

  it('correctly maps arbitrary transaction dates to exact period boundaries', () => {
    const { periods } = generateFiscalPeriods(2026, 1);

    const matchFirstDay = periods.find((p) => '2026-03-01' >= p.startDate && '2026-03-01' <= p.endDate);
    expect(matchFirstDay?.id).toBe('2026-03');

    const matchLastDay = periods.find((p) => '2026-03-31' >= p.startDate && '2026-03-31' <= p.endDate);
    expect(matchLastDay?.id).toBe('2026-03');

    const matchNextMonth = periods.find((p) => '2026-04-01' >= p.startDate && '2026-04-01' <= p.endDate);
    expect(matchNextMonth?.id).toBe('2026-04');
  });
});

