/**
 * Age helpers.
 *
 * Only the birth month and year are public, so age is calculated at month
 * granularity: a person born in December 2004 is treated as having turned a year
 * older at the start of December. The "current" month is read in Africa/Cairo so
 * the age rolls over on Egyptian time, not UTC.
 */

export interface BirthMonth {
  /** Four-digit year, e.g. 2004. */
  year: number;
  /** Month number, 1 (January) to 12 (December). */
  month: number;
}

/** Current year and month (1-12) in Africa/Cairo. */
export function getCairoYearMonth(now: Date = new Date()): BirthMonth {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  return { year, month };
}

/** Whole years completed since `birth`, at month granularity. */
export function calculateAge(birth: BirthMonth, now: Date = new Date()): number {
  const current = getCairoYearMonth(now);
  return current.year - birth.year - (current.month < birth.month ? 1 : 0);
}

/** "21 عامًا" / "21 years old". Western digits, matching the rest of the site. */
export function formatAge(age: number, lang: 'ar' | 'en'): string {
  if (lang === 'en') return `${age} years old`;
  if (age >= 3 && age <= 10) return `${age} أعوام`;
  return `${age} عامًا`;
}
