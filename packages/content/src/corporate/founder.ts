/**
 * RASHX Founder Information
 *
 * Factual information only. Do not add unverified credentials or claims.
 */

import type { LocalizedString, TeamMember } from '../types';

export const founder: TeamMember = {
  id: 'mohamed-rashad',
  name: {
    ar: 'م. محمد عبده رشاد البهي',
    en: 'Eng. Mohamed Abdo Rashad El-Bahy',
  } satisfies LocalizedString,
  title: {
    ar: 'المؤسس',
    en: 'Founder',
  } satisfies LocalizedString,
  bio: {
    ar: 'مؤسس RASHX | راش إكس.',
    en: 'Founder of RASHX | راش إكس.',
  },
};
