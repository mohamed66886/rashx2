/**
 * RASHX Centralized Route Registry
 *
 * Single source of truth for all application routes.
 * Import from here — never hardcode routes in components.
 *
 * Rules:
 * - All internal routes use string literals (type-safe)
 * - Dynamic routes use typed helper functions
 * - External URLs are clearly marked
 */

export const routes = {
  home: '/',

  // ── Corporate ─────────────────────────────────────────────
  about: '/about',
  story: '/story',
  vision: '/vision',
  values: '/values',
  founder: {
    index: '/founder',
    message: '/founder/message',
  },
  team: '/team',
  milestones: '/milestones',
  news: '/news',
  contact: '/contact',
  faq: '/faq',

  // ── Platform & Solutions ───────────────────────────────────
  platform: '/platform',
  solutions: {
    index: '/solutions',
    management: '/solutions/management',
    hr: '/solutions/hr',
    crm: '/solutions/crm',
    booking: '/solutions/booking',
    services: '/solutions/services',
    sales: '/solutions/sales',
    pos: '/solutions/pos',
    purchasing: '/solutions/purchasing',
    inventory: '/solutions/inventory',
    loyalty: '/solutions/loyalty',
    notifications: '/solutions/notifications',
    analytics: '/solutions/analytics',
    branches: '/solutions/branches',
    subscriptions: '/solutions/subscriptions',
  },

  // ── Digital Experience ─────────────────────────────────────
  websites: '/websites',
  customerExperience: '/customer-experience',
  providerExperience: '/provider-experience',
  apps: '/apps',
  whiteLabel: '/white-label',
  branding: '/branding',
  customDomains: '/custom-domains',
  integrations: '/integrations',
  developers: {
    index: '/developers',
    api: '/developers/api',
  },

  // ── Industries ─────────────────────────────────────────────
  industries: {
    index: '/industries',
    barbershops: '/industries/barbershops',
    beautySalons: '/industries/beauty-salons',
    beautyCenters: '/industries/beauty-centers',
    spa: '/industries/spa',
    personalCare: '/industries/personal-care',
    multiBranch: '/industries/multi-branch',
  },

  // ── Trust ──────────────────────────────────────────────────
  security: {
    index: '/security',
    accountProtection: '/security/account-protection',
    accessControl: '/security/access-control',
    tenantIsolation: '/security/tenant-isolation',
  },
  compliance: {
    index: '/compliance',
    eInvoicing: '/compliance/e-invoicing',
  },
  reliability: '/reliability',

  // ── Commercial ─────────────────────────────────────────────
  pricing: {
    index: '/pricing',
    compare: '/pricing/compare',
  },
  demo: '/demo',
  getStarted: '/get-started',
  registerInterest: '/register-interest',
  consultation: '/consultation',
  quote: '/quote',
  partners: {
    index: '/partners',
    program: '/partners/program',
    apply: '/partners/apply',
  },
  salesContact: '/sales',

  // ── Content ────────────────────────────────────────────────
  blog: {
    index: '/blog',
    category: (category: string) => `/blog/${category}`,
    article: (category: string, slug: string) => `/blog/${category}/${slug}`,
  },
  caseStudies: {
    index: '/case-studies',
    detail: (slug: string) => `/case-studies/${slug}`,
  },
  newsroom: {
    index: '/newsroom',
    press: '/newsroom/press',
  },
  media: '/media',
  gallery: '/gallery',
  downloads: '/downloads',

  // ── Support & Careers ──────────────────────────────────────
  help: {
    index: '/help',
    guides: '/help/guides',
    technical: '/help/technical',
  },
  support: {
    index: '/support',
    report: '/support/report',
  },
  careers: {
    index: '/careers',
    detail: (slug: string) => `/careers/${slug}`,
    apply: (slug: string) => `/careers/${slug}/apply`,
    internships: '/careers/internships',
  },
  status: '/status',

  // ── Public Directory ───────────────────────────────────────
  salons: {
    index: '/salons',
    search: '/salons/search',
    city: (city: string) => `/salons/city/${city}`,
    category: (category: string) => `/salons/category/${category}`,
    profile: (slug: string) => `/salons/${slug}`,
  },

  // ── Brand Center ───────────────────────────────────────────
  brand: {
    index: '/brand',
    identity: '/brand/identity',
    logo: {
      index: '/brand/logo',
      arabic: '/brand/logo/arabic',
      english: '/brand/logo/english',
      symbol: '/brand/logo/symbol',
      monogram: '/brand/logo/monogram',
    },
    colors: '/brand/colors',
    typography: '/brand/typography',
    icons: '/brand/icons',
    illustrations: '/brand/illustrations',
    patterns: '/brand/patterns',
    photography: '/brand/photography',
    voice: '/brand/voice',
    guidelines: '/brand/guidelines',
    assets: '/brand/assets',
  },

  // ── Legal ──────────────────────────────────────────────────
  terms: '/terms',
  privacy: '/privacy',
  cookies: '/cookies',
  acceptableUse: '/acceptable-use',
  dataProcessing: '/data-processing',
  subscriptionTerms: '/subscription-terms',
  refundPolicy: '/refund-policy',
  sla: '/sla',
  securityDisclosure: '/security-disclosure',
  accessibilityStatement: '/accessibility-statement',

  // ── External ───────────────────────────────────────────────
  external: {
    app: 'https://app.rashx.org',
    twitter: 'https://twitter.com/rashx',
    linkedin: 'https://linkedin.com/company/rashx',
    instagram: 'https://instagram.com/rashx',
  },
} as const;

export type Routes = typeof routes;
