/**
 * Age helpers.
 *
 * Age is exact to the day. "Today" is read in Africa/Cairo so the age rolls over
 * at Egyptian midnight, not UTC midnight.
 */

export interface BirthDate {
  /** Four-digit year, e.g. 2004. */
  year: number;
  /** Month number, 1 (January) to 12 (December). */
  month: number;
  /** Day of month, 1-31. */
  day: number;
}

/** Current calendar date in Africa/Cairo. */
export function getCairoDate(now: Date = new Date()): BirthDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);

  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: pick('year'), month: pick('month'), day: pick('day') };
}

/** Whole years completed since `birth`. */
export function calculateAge(birth: BirthDate, now: Date = new Date()): number {
  const today = getCairoDate(now);
  const hadBirthday =
    today.month > birth.month || (today.month === birth.month && today.day >= birth.day);
  return today.year - birth.year - (hadBirthday ? 0 : 1);
}

/** "21 عامًا" / "21 years old". Western digits, matching the rest of the site. */
export function formatAge(age: number, lang: 'ar' | 'en'): string {
  if (lang === 'en') return `${age} years old`;
  if (age >= 3 && age <= 10) return `${age} أعوام`;
  return `${age} عامًا`;
}
