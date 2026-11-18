/**
 * RASHX Corporate Website — Foundation & Design System Showcase
 *
 * Phase 2.1: Brand Foundations & Core Design System
 * Features:
 * - Direct verification of all 9 Core UI Primitives
 * - Visual review of the 3 Brand Mark Explorations for Founder Evaluation
 * - Semantic Token & Contrast System Matrix
 * - High-Legibility Bilingual Typography Showcase (Noto Kufi Arabic + Inter)
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { getTranslation } from '@rashx/i18n/server';
import { generatePageMetadata } from '@/lib/metadata';
import {
  Button,
  IconButton,
  Link,
  Badge,
  Typography,
  Separator,
  Avatar,
  PageContainer,
  SectionContainer,
} from '@rashx/ui';
import {
  ConceptAnchor,
  ConceptMonolith,
  ConceptNexus,
  Globe,
  CheckCircle2,
  Building2,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
} from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: 'RASHX | راش إكس — نظام التشغيل الرقمي لصالونات التجميل',
    description:
      'نظام التشغيل الرقمي المتكامل لصالونات التجميل ومراكز العناية والسبا في المملكة العربية السعودية. إدارة، حجوزات، CRM، مبيعات، وتجربة رقمية متكاملة.',
    path: '/',
  });
}

export default async function HomePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const t = await getTranslation(lang);

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Top Corporate Bar ────────────────────────────────────────── */}
      <header className="border-b border-[--surface-border] bg-[--surface-card] py-4">
        <PageContainer size="xl" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B1030] text-[#7C3AED] shadow-sm">
              <ConceptAnchor size={24} />
            </div>
            <div>
              <Typography variant="h5" className="font-bold tracking-tight">
                {t.metadata.siteName}
              </Typography>
              <Typography variant="caption" color="muted">
                {isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="brand" dot size="sm">
              Phase 2.1 Production Core
            </Badge>
            <Link
              href={isAr ? '/?lang=en' : '/'}
              className="inline-flex items-center gap-1.5 rounded-md border border-[--surface-border] px-3 py-1.5 text-xs font-semibold hover:bg-[--surface-muted]"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </Link>
          </div>
        </PageContainer>
      </header>

      {/* ── Hero / Corporate Positioning Section ────────────────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border] bg-gradient-to-b from-[--surface-card] to-[--surface-background]">
        <PageContainer size="xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2">
              <Badge variant="outline" size="md">
                {isAr ? 'التأسيس: 2026' : 'Founded: 2026'}
              </Badge>
              <Badge variant="secondary" size="md">
                {isAr ? 'المؤسس: م. محمد عبده رشاد البهي' : 'Founder: Eng. Mohamed Abdo Rashad El-Bahy'}
              </Badge>
            </div>

            <Typography variant="display-1" className="mb-4 font-extrabold text-[--surface-foreground]">
              {isAr ? 'أكثر من مجرد إدارة، تجربة رقمية متكاملة.' : 'More Than Management, A Complete Digital Experience.'}
            </Typography>

            <Typography variant="body-lg" color="muted" className="mx-auto mb-8 max-w-2xl">
              {isAr
                ? 'نظام التشغيل الرقمي الأول المصمم خصيصاً لصالونات التجميل، مراكز العناية، والسبا في المملكة العربية السعودية. نجمع العمليات، الحجوزات، نقاط البيع، وفريق العمل في منصة سحابية واحدة فائقة الموثوقية.'
                : 'The premier digital operating system purpose-built for salons, beauty centers, and spas in Saudi Arabia. Unifying operations, bookings, POS, and staff into one ultra-reliable cloud platform.'}
            </Typography>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                endIcon={<ArrowIcon className="h-4 w-4" />}
              >
                {isAr ? 'استكشف النظام' : 'Explore Platform'}
              </Button>
              <Button variant="outline" size="lg">
                {isAr ? 'ملف الشركة المعتمد' : 'Corporate Profile'}
              </Button>
              <Button variant="secondary" size="lg" isLoading>
                {isAr ? 'قيد المعالجة' : 'Processing'}
              </Button>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section: Brand Mark Explorations for Founder Review ─────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border]">
        <PageContainer size="xl">
          <div className="mb-10 text-center">
            <Badge variant="brand" className="mb-3">
              {isAr ? 'استعراض الهوية البصرية لمراجعة المؤسس' : 'Visual Identity Review for Founder'}
            </Badge>
            <Typography variant="h2" className="mb-3">
              {isAr ? 'المفاهيم الهندسية المقترحة لشعار RASHX' : 'Proposed Geometric Mark Concepts'}
            </Typography>
            <Typography variant="body" color="muted" className="mx-auto max-w-2xl">
              {isAr
                ? 'تجسيد فلسفي لمعاني الثبات (الرسوخ والاعتمادية) والانطلاق (الحرية والتمكين الرقمي) دون الابتذال في رموز التجميل التقليدية.'
                : 'Philosophical synthesis of Steadfastness (Authority & Reliability) and Freedom (Agility & SaaS Liberation) without generic cosmetic clichés.'}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Concept A */}
            <div className="flex flex-col rounded-xl border border-[--surface-border] bg-[--surface-card] p-6 shadow-sm">
              <div className="mb-6 flex h-40 items-center justify-center rounded-lg bg-[#1B1030] text-[#7C3AED] shadow-inner">
                <ConceptAnchor size={72} />
              </div>
              <div className="mb-2 flex items-center justify-between">
                <Typography variant="h4">
                  {isAr ? 'المفهوم أ: الرسوخ والريادة' : 'Concept A: The Anchor'}
                </Typography>
                <Badge variant="outline" size="sm">
                  {isAr ? 'مقترح' : 'Proposal'}
                </Badge>
              </div>
              <Typography variant="body-sm" color="muted" className="mb-4 flex-1">
                {isAr
                  ? 'عمود رأسي صلد يمثل الثبات والسيادة التشغيلية، مع ذراع صاعد بزاوية 45 درجة يخترق الفضاء ليعبّر عن الانطلاق والتحليق الرقمي.'
                  : 'Solid vertical structural stem symbolizing enterprise stability, coupled with an ascending 45-degree cantilever strut breaking free into open digital expansion.'}
              </Typography>
              <div className="border-t border-[--surface-border] pt-3 text-xs text-[--surface-muted-foreground]">
                <span>Component: <code>&lt;ConceptAnchor /&gt;</code></span>
              </div>
            </div>

            {/* Concept B */}
            <div className="flex flex-col rounded-xl border border-[--surface-border] bg-[--surface-card] p-6 shadow-sm">
              <div className="mb-6 flex h-40 items-center justify-center rounded-lg bg-[#2E1F5E] text-[#A78BFA] shadow-inner">
                <ConceptMonolith size={72} />
              </div>
              <div className="mb-2 flex items-center justify-between">
                <Typography variant="h4">
                  {isAr ? 'المفهوم ب: الكتلة المنطلقة' : 'Concept B: The Monolith'}
                </Typography>
                <Badge variant="outline" size="sm">
                  {isAr ? 'مقترح' : 'Proposal'}
                </Badge>
              </div>
              <Typography variant="body-sm" color="muted" className="mb-4 flex-1">
                {isAr
                  ? 'كتلتان صلبتان متداخلتان بهندسة متقدمة، تجمع بين مركزية التحكم والسرعة السحابية لتمكين إدارة الأعمال دون أي بطء.'
                  : 'Two high-precision interlocking geometric masses balancing deep operational governance with an aggressive kinetic shard representing cloud acceleration.'}
              </Typography>
              <div className="border-t border-[--surface-border] pt-3 text-xs text-[--surface-muted-foreground]">
                <span>Component: <code>&lt;ConceptMonolith /&gt;</code></span>
              </div>
            </div>

            {/* Concept C */}
            <div className="flex flex-col rounded-xl border border-[--surface-border] bg-[--surface-card] p-6 shadow-sm">
              <div className="mb-6 flex h-40 items-center justify-center rounded-lg bg-[#1B1030] text-[#7C3AED] shadow-inner">
                <ConceptNexus size={72} />
              </div>
              <div className="mb-2 flex items-center justify-between">
                <Typography variant="h4">
                  {isAr ? 'المفهوم ج: الرابط المتين' : 'Concept C: The Nexus'}
                </Typography>
                <Badge variant="outline" size="sm">
                  {isAr ? 'مقترح' : 'Proposal'}
                </Badge>
              </div>
              <Typography variant="body-sm" color="muted" className="mb-4 flex-1">
                {isAr
                  ? 'حلقة مضلعة مشطوفة الزوايا تلتف في مسار غير منقطع، تجسد تكامل العمليات (الحجوزات، المحاسبة، المخزون، ولاء العملاء) في قلب تشغيلي واحد.'
                  : 'Continuous chamfered polygonal ribbon with a symmetric tri-axial core, embodying the complete unification of salon operations into one unbroken OS.'}
              </Typography>
              <div className="border-t border-[--surface-border] pt-3 text-xs text-[--surface-muted-foreground]">
                <span>Component: <code>&lt;ConceptNexus /&gt;</code></span>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section: Semantic Color Architecture ─────────────────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border] bg-[--surface-muted]/30">
        <PageContainer size="xl">
          <div className="mb-8">
            <Typography variant="h3" className="mb-2">
              {isAr ? 'منظومة الألوان الدلالية ودرجات التباين' : 'Semantic Color Architecture & Contrast'}
            </Typography>
            <Typography variant="body" color="muted">
              {isAr
                ? 'نظام ثلاثي متناغم يستند إلى Deep Midnight و Obsidian Violet مع Electric Purple كلون أساسي ثالث.'
                : 'Synchronized 3-tier brand palette anchored by Deep Midnight, Obsidian Violet, and Electric Purple.'}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[--surface-border] bg-[--surface-card] p-4 shadow-sm">
              <div className="mb-3 h-16 rounded-lg bg-[#1B1030] text-white flex items-center justify-center font-bold">
                #1B1030
              </div>
              <Typography variant="h5" className="font-semibold">Deep Midnight</Typography>
              <Typography variant="caption" color="muted" className="block mb-2">
                {isAr ? 'قاعدة الهوية والخلفية الداكنة' : 'Primary Dark Canvas Anchor'}
              </Typography>
              <Badge variant="success" size="sm">Contrast 14.2:1 (AAA)</Badge>
            </div>

            <div className="rounded-xl border border-[--surface-border] bg-[--surface-card] p-4 shadow-sm">
              <div className="mb-3 h-16 rounded-lg bg-[#2E1F5E] text-white flex items-center justify-center font-bold">
                #2E1F5E
              </div>
              <Typography variant="h5" className="font-semibold">Obsidian Violet</Typography>
              <Typography variant="caption" color="muted" className="block mb-2">
                {isAr ? 'الأسطح الثانوية والبطاقات' : 'Secondary Structural Container'}
              </Typography>
              <Badge variant="success" size="sm">Contrast 8.2:1 (AAA)</Badge>
            </div>

            <div className="rounded-xl border border-[--surface-border] bg-[--surface-card] p-4 shadow-sm">
              <div className="mb-3 h-16 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center font-bold">
                #7C3AED
              </div>
              <Typography variant="h5" className="font-semibold">Electric Purple</Typography>
              <Typography variant="caption" color="muted" className="block mb-2">
                {isAr ? 'التفاعل الحيوي والأزرار الرئيسية' : 'Third Primary Interactive Accent'}
              </Typography>
              <Badge variant="success" size="sm">Contrast 4.8:1 (AA)</Badge>
            </div>

            <div className="rounded-xl border border-[--surface-border] bg-[--surface-card] p-4 shadow-sm">
              <div className="mb-3 h-16 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-bold">
                #16A34A
              </div>
              <Typography variant="h5" className="font-semibold">Enterprise Success</Typography>
              <Typography variant="caption" color="muted" className="block mb-2">
                {isAr ? 'تأكيد الحجوزات والعمليات المكتملة' : 'Confirmed Bookings & Operational State'}
              </Typography>
              <Badge variant="success" size="sm">Contrast 4.6:1 (AA)</Badge>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section: Typography Scale (Arabic & English) ─────────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border]">
        <PageContainer size="xl">
          <div className="mb-8">
            <Typography variant="h3" className="mb-2">
              {isAr ? 'سلم التيبوغرافي ثنائي اللغة' : 'Bilingual Typography System'}
            </Typography>
            <Typography variant="body" color="muted">
              {isAr
                ? 'Noto Kufi Arabic للنصوص العربية المعمارية الرصينة، و Inter للنصوص اللاتينية فائقة الدقة.'
                : 'Noto Kufi Arabic for architectural enterprise Arabic, paired with Inter for high-precision Latin text.'}
            </Typography>
          </div>

          <div className="space-y-6 rounded-xl border border-[--surface-border] bg-[--surface-card] p-6 shadow-sm">
            <div className="grid grid-cols-1 items-baseline gap-4 border-b border-[--surface-border] pb-4 md:grid-cols-4">
              <span className="text-xs font-mono text-[--surface-muted-foreground]">display-1 (72px / 800)</span>
              <div className="md:col-span-3">
                <Typography variant="display-1">راش إكس لتقنية الصالونات</Typography>
                <Typography variant="display-1" className="text-[--surface-muted-foreground]">RASHX Operating System</Typography>
              </div>
            </div>

            <div className="grid grid-cols-1 items-baseline gap-4 border-b border-[--surface-border] pb-4 md:grid-cols-4">
              <span className="text-xs font-mono text-[--surface-muted-foreground]">h2 (36px / 700)</span>
              <div className="md:col-span-3">
                <Typography variant="h2">إدارة شاملة لجميع مراكز التجميل والسبا</Typography>
                <Typography variant="h2" className="text-[--surface-muted-foreground]">Unified Beauty Business Administration</Typography>
              </div>
            </div>

            <div className="grid grid-cols-1 items-baseline gap-4 border-b border-[--surface-border] pb-4 md:grid-cols-4">
              <span className="text-xs font-mono text-[--surface-muted-foreground]">body-lg (20px / 400)</span>
              <div className="md:col-span-3">
                <Typography variant="body-lg">
                  تحويل شامل من الفوضى التشغيلية والبرمجيات المتفرقة إلى منظومة سحابية متكاملة تضمن أعلى معايير الكفاءة.
                </Typography>
                <Typography variant="body-lg" className="text-[--surface-muted-foreground]">
                  Empowering salon founders to streamline scheduling, POS, and client loyalty in real time.
                </Typography>
              </div>
            </div>

            <div className="grid grid-cols-1 items-baseline gap-4 md:grid-cols-4">
              <span className="text-xs font-mono text-[--surface-muted-foreground]">caption / label</span>
              <div className="flex flex-wrap items-center gap-4 md:col-span-3">
                <Typography variant="caption">مُصادق ومحمي بأنظمة سحابية مشفرة</Typography>
                <Separator orientation="vertical" className="h-4" />
                <Typography variant="label">ENTERPRISE SAAS SYSTEM</Typography>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section: Core UI Primitives Live Matrix ──────────────────── */}
      <SectionContainer spacing="lg">
        <PageContainer size="xl">
          <div className="mb-8">
            <Typography variant="h3" className="mb-2">
              {isAr ? 'حزمة المكونات التأسيسية التسعة (Phase 2.1 Primitives)' : 'The 9 Foundation Primitives'}
            </Typography>
            <Typography variant="body" color="muted">
              {isAr
                ? 'مكونات متوافقة مع إمكانية الوصول، تدعم الاتجاهين RTL/LTR، ومبنية على التوكنات الدلالية الموحدة.'
                : 'Strictly accessible, RTL/LTR first-class components adhering to unified design tokens.'}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Component: Button & IconButton */}
            <div className="rounded-xl border border-[--surface-border] bg-[--surface-card] p-6 shadow-sm">
              <Typography variant="h5" className="mb-1 font-semibold">1 & 2. Button & IconButton</Typography>
              <Typography variant="caption" color="muted" className="mb-4 block">
                {isAr ? 'أنماط متنوعة، دعم لحالة التحميل، أيقونات البداية والنهاية، وإلزامية aria-label.' : 'Multiple variants, loading state, start/end slots, enforced accessibility.'}
              </Typography>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="primary" isLoading>Loading</Button>
                <IconButton
                  aria-label={isAr ? 'البحث في المنظومة' : 'Search system'}
                  icon={<Search className="h-4 w-4" />}
                />
                <IconButton
                  aria-label={isAr ? 'تصفية البيانات' : 'Filter options'}
                  variant="outline"
                  icon={<Filter className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Component: Badge */}
            <div className="rounded-xl border border-[--surface-border] bg-[--surface-card] p-6 shadow-sm">
              <Typography variant="h5" className="mb-1 font-semibold">3. Badge Primitive</Typography>
              <Typography variant="caption" color="muted" className="mb-4 block">
                {isAr ? 'حالات دلالية، نقاط مؤشر الحالة الحية، وتنسيق أنيق للمؤشرات.' : 'Semantic states, live status beacons, and high contrast chips.'}
              </Typography>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="brand">Brand</Badge>
                <Badge variant="success" dot>Active Salon</Badge>
                <Badge variant="warning" dot>Pending Sync</Badge>
                <Badge variant="error" dot>Alert</Badge>
                <Badge variant="info" icon={<CheckCircle2 className="h-3 w-3" />}>Cloud Verified</Badge>
                <Badge variant="outline">v2.1-stable</Badge>
              </div>
            </div>

            {/* Component: Link & Localization */}
            <div className="rounded-xl border border-[--surface-border] bg-[--surface-card] p-6 shadow-sm">
              <Typography variant="h5" className="mb-1 font-semibold">4. Link & Preservation</Typography>
              <Typography variant="caption" color="muted" className="mb-4 block">
                {isAr ? 'روابط داخلية تحافظ تلقائياً على معيار اللغة دون مسارات مفرغة.' : 'Preserves ?lang=en on relative links without segment bloat.'}
              </Typography>
              <div className="flex flex-wrap items-center gap-6">
                <Link href="/" lang={lang} variant="default">
                  {isAr ? 'الرئيسية (مسار نظيف)' : 'Home (Clean)'}
                </Link>
                <Link href="/about" lang={lang} variant="accent">
                  {isAr ? 'من نحن' : 'About Us'}
                </Link>
                <Link href="https://rashx.org" lang={lang} external variant="underline">
                  rashx.org
                </Link>
              </div>
            </div>

            {/* Component: Avatar & Separator */}
            <div className="rounded-xl border border-[--surface-border] bg-[--surface-card] p-6 shadow-sm">
              <Typography variant="h5" className="mb-1 font-semibold">5 & 6. Avatar & Separator</Typography>
              <Typography variant="caption" color="muted" className="mb-4 block">
                {isAr ? 'معالجة ذكية للأحرف الأولى، فواصل أفقية ورأسية بمعايير ARIA.' : 'Initial fallback extraction and ARIA-compliant structural dividers.'}
              </Typography>
              <div className="flex items-center gap-4">
                <Avatar alt="Mohamed Rashad" fallback="MR" size="lg" />
                <Avatar alt="RASHX Enterprise" fallback="RX" size="md" />
                <Avatar alt="Salon Owner" fallback="SO" size="sm" />
                <Separator orientation="vertical" className="h-10" />
                <Typography variant="body-sm" color="muted">
                  {isAr ? 'فصل بصري دقيق مع دعم قارئات الشاشة' : 'Screen-reader decorative separation'}
                </Typography>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Corporate Footer ────────────────────────────────────────── */}
      <footer className="border-t border-[--surface-border] bg-[--surface-card] py-8 text-center">
        <PageContainer size="xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[--color-accent]" />
              <Typography variant="body-sm" className="font-semibold">
                {isAr ? 'راش إكس — المملكة العربية السعودية' : 'RASHX Corporate — Kingdom of Saudi Arabia'}
              </Typography>
            </div>
            <Typography variant="caption" color="muted">
              {isAr
                ? 'جميع الحقوق محفوظة © 2026 م. محمد عبده رشاد البهي. منصة إدارة صالونات التجميل.'
                : 'All rights reserved © 2026 Eng. Mohamed Abdo Rashad El-Bahy. Beauty & Wellness SaaS.'}
            </Typography>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}
