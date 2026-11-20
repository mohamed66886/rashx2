/**
 * RASHX Founder Information
 *
 * Factual information only. Do not add unverified credentials or claims.
 * Everything here is rendered visibly on /founder and mirrored in the Person
 * JSON-LD, so change it here once and both stay in sync.
 *
 * Items marked "self-reported" come from the founder himself and have no public
 * document behind them yet. Keep the wording soft ("worked on", not "led") until
 * named, linkable projects can back them.
 */

import type { LocalizedString, TeamMember } from '../types';
import type { BirthDate } from './age';

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

/** Folder under apps/web/public that holds the founder's photos. */
export const FOUNDER_PHOTO_DIR = 'images/founder' as const;
/** Base name of the main portrait (main.jpg / .png / .webp). Used in the hero and as Person.image. */
export const FOUNDER_MAIN_PHOTO = 'main' as const;
/** Base name of the optional 1200x630 social-share image. Falls back to the site default OG image. */
export const FOUNDER_OG_PHOTO = 'og' as const;

/** Personal profiles. Tracking parameters (igsh, utm_*) are stripped on purpose. */
export const founderProfiles = {
  linkedin: 'https://www.linkedin.com/in/mohamed-abdou-rashad-898348335',
  instagram: 'https://www.instagram.com/m7md_rsh3d',
  github: 'https://github.com/mohamed66886',
} as const;

export interface FounderProfile {
  /** Full birth date, published by the founder's own choice. */
  birth: BirthDate;
  /** Every spelling people actually search or write. Shown on the page and in JSON-LD. */
  aliases: { ar: readonly string[]; en: readonly string[] };
  birthPlace: LocalizedString;
  education: LocalizedString;
  yearsOfExperience: number;
  summary: LocalizedString;
  intro: { ar: readonly string[]; en: readonly string[] };
  highlights: ReadonlyArray<{ title: LocalizedString; text: LocalizedString }>;
  milestones: ReadonlyArray<{ when: LocalizedString; text: LocalizedString }>;
  expertise: { ar: readonly string[]; en: readonly string[] };
}

export const founderProfile: FounderProfile = {
  birth: { year: 2004, month: 12, day: 1 },

  aliases: {
    ar: ['محمد رشاد', 'محمد البهي', 'محمد عبده رشاد', 'محمد رشاد البهي'],
    en: [
      'Mohamed Abdou Rashad',
      'Mohamed Rashad',
      'Mohamed El-Bahy',
      'Mohamed Abdo Rashad',
      'm7md_rsh3d',
    ],
  },

  birthPlace: {
    ar: 'قرية منشأة عبد الرحمن، مركز دكرنس، محافظة الدقهلية، مصر',
    en: "Mansha'at Abd El-Rahman village, Dakarnis district, Dakahlia Governorate, Egypt",
  },

  education: {
    ar: 'علوم الحاسب، الجامعة الأوروبية في ليفكي (EUL)',
    en: 'Computer Science, European University of Lefke (EUL)',
  },

  // Self-reported by the founder (4+ years). Update here if it changes.
  yearsOfExperience: 4,

  summary: {
    ar: 'مبرمج ومطوّر برمجيات مصري، ومؤسس منصة راش إكس (RASHX) لإدارة الصالونات ومراكز التجميل والسبا.',
    en: 'Egyptian software developer and founder of RASHX, a cloud platform for beauty salons, beauty centers and spas.',
  },

  intro: {
    ar: [
      'محمد عبده رشاد البهي، ويُعرف أيضًا باسم محمد رشاد أو محمد البهي، مبرمج ومطوّر برمجيات مصري ومؤسس منصة راش إكس. وُلد في 1 ديسمبر 2004 في قرية منشأة عبد الرحمن التابعة لمركز دكرنس بمحافظة الدقهلية في مصر.',
      'شغفه بالبرمجة والتكنولوجيا بدأ منذ صغره، ودرس علوم الحاسب في الجامعة الأوروبية في ليفكي (EUL)، وهو معتمد من IEEE ونشط فيها. لديه خبرة تزيد على أربع سنوات في مجال البرمجيات، وعمل على تصميم وتطوير تطبيقات وأنظمة لجهات في مصر وتركيا ودول الخليج.',
      'في عام 2026 أسس راش إكس، وهي منصة سحابية تجمع الحجوزات وإدارة العملاء والموارد البشرية والمبيعات والمخزون والفوترة الإلكترونية (ZATCA) في نظام واحد للمنشآت النسائية والرجالية في المملكة العربية السعودية.',
    ],
    en: [
      'Mohamed Abdou Rashad El-Bahy, also known as Mohamed Rashad or Mohamed El-Bahy, is an Egyptian software developer and the founder of RASHX. He was born on 1 December 2004 in Mansha\'at Abd El-Rahman village, Dakarnis district, Dakahlia Governorate, Egypt.',
      'He has been passionate about programming and technology since childhood. He studied Computer Science at the European University of Lefke (EUL), is IEEE-certified and active in IEEE. He has more than four years of experience in software and has worked on designing and developing apps and systems for organizations in Egypt, Turkey and the Gulf.',
      'In 2026 he founded RASHX, a cloud platform that brings bookings, CRM, HR, sales, inventory and ZATCA e-invoicing into one system for beauty salons, barbershops and spas in Saudi Arabia.',
    ],
  },

  highlights: [
    {
      title: { ar: 'التعليم', en: 'Education' },
      text: {
        ar: 'علوم الحاسب، الجامعة الأوروبية في ليفكي (EUL).',
        en: 'Computer Science, European University of Lefke (EUL).',
      },
    },
    {
      title: { ar: 'IEEE', en: 'IEEE' },
      text: {
        ar: 'معتمد من IEEE، وعضو طلابي، وأمين سر فرع جامعة كفر الشيخ ضمن العمل التطوعي (يناير – أكتوبر 2026).',
        en: 'IEEE-certified, IEEE Student Member and volunteer Secretary of the Kafrelsheikh University branch (January – October 2026).',
      },
    },
    {
      title: { ar: 'الخبرة', en: 'Experience' },
      text: {
        ar: 'أكثر من 4 سنوات في تطوير البرمجيات، مع أعمال لجهات في مصر وتركيا ودول الخليج.',
        en: 'More than 4 years in software development, with work for organizations in Egypt, Turkey and the Gulf.',
      },
    },
    {
      title: { ar: 'راش إكس', en: 'RASHX' },
      text: {
        ar: 'مؤسس منصة إدارة الصالونات ومراكز التجميل والسبا في السعودية (2026).',
        en: 'Founder of the salon, beauty center and spa management platform in Saudi Arabia (2026).',
      },
    },
  ],

  milestones: [
    {
      when: { ar: '1 ديسمبر 2004', en: '1 December 2004' },
      text: {
        ar: 'الميلاد في منشأة عبد الرحمن، دكرنس، الدقهلية.',
        en: "Born in Mansha'at Abd El-Rahman, Dakarnis, Dakahlia.",
      },
    },
    {
      when: { ar: 'يناير – أكتوبر 2026', en: 'January – October 2026' },
      text: {
        ar: 'أمين سر (تطوعًا) في فرع IEEE بجامعة كفر الشيخ.',
        en: 'Volunteer Secretary, IEEE Kafrelsheikh University branch.',
      },
    },
    {
      when: { ar: '2026', en: '2026' },
      text: {
        ar: 'تأسيس راش إكس وإطلاق منصة إدارة الصالونات في المملكة العربية السعودية.',
        en: 'Founded RASHX and launched the salon management platform in Saudi Arabia.',
      },
    },
  ],

  expertise: {
    ar: [
      'تطوير تطبيقات الويب',
      'تطبيقات الموبايل',
      'منصات SaaS السحابية',
      'أنظمة إدارة الأعمال',
      'Next.js',
      'React Native',
      'NestJS',
      'PostgreSQL',
    ],
    en: [
      'Web application development',
      'Mobile app development',
      'Cloud SaaS platforms',
      'Business management systems',
      'Next.js',
      'React Native',
      'NestJS',
      'PostgreSQL',
    ],
  },
};

export interface FounderFaqItem {
  question: string;
  answer: string;
}

/**
 * Visible FAQ + FAQPage JSON-LD source. Answers are short and self-contained so
 * an answer engine can lift one without the rest of the page.
 * `ageText` is passed in already formatted, e.g. "21 عامًا".
 */
export function getFounderFaq(lang: 'ar' | 'en', ageText: string): FounderFaqItem[] {
  if (lang === 'ar') {
    return [
      {
        question: 'من هو محمد عبده رشاد البهي؟',
        answer:
          'محمد عبده رشاد البهي (ويُعرف أيضًا بمحمد رشاد ومحمد البهي) مبرمج ومطوّر برمجيات مصري، ومؤسس منصة راش إكس (RASHX) لإدارة الصالونات ومراكز التجميل والسبا. وُلد في 1 ديسمبر 2004 في محافظة الدقهلية بمصر.',
      },
      {
        question: 'كم عمر محمد عبده رشاد البهي؟',
        answer: `وُلد محمد عبده رشاد البهي في 1 ديسمبر 2004، وعمره الآن ${ageText}.`,
      },
      {
        question: 'من أين محمد عبده رشاد البهي؟',
        answer:
          'هو من قرية منشأة عبد الرحمن التابعة لمركز دكرنس بمحافظة الدقهلية في مصر.',
      },
      {
        question: 'أين درس محمد عبده رشاد البهي؟',
        answer:
          'درس علوم الحاسب في الجامعة الأوروبية في ليفكي (EUL)، وهو معتمد من IEEE ونشط فيها.',
      },
      {
        question: 'ما علاقة محمد عبده رشاد البهي بـ IEEE؟',
        answer:
          'هو معتمد من IEEE وعضو طلابي فيها، وشغل منصب أمين سر في فرع جامعة كفر الشيخ ضمن العمل التطوعي من يناير إلى أكتوبر 2026.',
      },
      {
        question: 'ما خبرة محمد عبده رشاد البهي في البرمجة؟',
        answer:
          'لديه خبرة تزيد على أربع سنوات في مجال البرمجيات، وعمل على تصميم وتطوير تطبيقات وأنظمة لجهات في مصر وتركيا ودول الخليج، وأسس راش إكس عام 2026.',
      },
      {
        question: 'ما هي راش إكس (RASHX)؟',
        answer:
          'راش إكس منصة سحابية لإدارة الصالونات ومراكز التجميل والسبا في السعودية، تجمع الحجوزات وإدارة العملاء والموارد البشرية والمبيعات والمخزون والفوترة الإلكترونية (ZATCA) في نظام واحد.',
      },
      {
        question: 'كيف أتواصل مع محمد عبده رشاد البهي؟',
        answer:
          'عبر حسابه على LinkedIn أو Instagram (m7md_rsh3d) أو GitHub (mohamed66886)، أو عبر صفحة التواصل في موقع راش إكس: rashx.org/contact.',
      },
    ];
  }

  return [
    {
      question: 'Who is Mohamed Abdou Rashad El-Bahy?',
      answer:
        'Mohamed Abdou Rashad El-Bahy, also known as Mohamed Rashad or Mohamed El-Bahy, is an Egyptian software developer and the founder of RASHX, a platform for managing beauty salons, beauty centers and spas. He was born on 1 December 2004 in Dakahlia, Egypt.',
    },
    {
      question: 'How old is Mohamed Abdou Rashad El-Bahy?',
      answer: `Mohamed Abdou Rashad El-Bahy was born on 1 December 2004 and is ${ageText}.`,
    },
    {
      question: 'Where is Mohamed Abdou Rashad El-Bahy from?',
      answer:
        "He is from Mansha'at Abd El-Rahman village in Dakarnis district, Dakahlia Governorate, Egypt.",
    },
    {
      question: 'Where did Mohamed Abdou Rashad El-Bahy study?',
      answer:
        'He studied Computer Science at the European University of Lefke (EUL) and is IEEE-certified and active in IEEE.',
    },
    {
      question: 'What is his connection to IEEE?',
      answer:
        'He is IEEE-certified, an IEEE Student Member, and served as volunteer Secretary of the IEEE Kafrelsheikh University branch from January to October 2026.',
    },
    {
      question: 'How much programming experience does he have?',
      answer:
        'He has more than four years of experience in software and has worked on designing and developing apps and systems for organizations in Egypt, Turkey and the Gulf. He founded RASHX in 2026.',
    },
    {
      question: 'What is RASHX?',
      answer:
        'RASHX is a cloud platform for beauty salons, beauty centers and spas in Saudi Arabia. It brings bookings, CRM, HR, sales, inventory and ZATCA e-invoicing into one system.',
    },
    {
      question: 'How can I contact Mohamed Abdou Rashad El-Bahy?',
      answer:
        'Through his LinkedIn, Instagram (m7md_rsh3d) or GitHub (mohamed66886) profiles, or through the RASHX contact page at rashx.org/contact.',
    },
  ];
}
