/**
 * RASHX Corporate Website — Official Brand Identity Showcase & Verification Hub
 *
 * Single Source of Truth: rashx-brand/
 * Approved by Founder: Eng. Mohamed Abdo Rashad El-Bahy
 *
 * Features:
 * 1. Official Vector Logos (Bilingual Lockup, English Wordmark, Arabic Wordmark, Rx Symbol)
 * 2. Official Brand Palette (Warm Peach, Dusty Blue, White, Soft Cream, Ink)
 * 3. Logo on Color Variations & Background Pairing Verification
 * 4. Multi-Size Matrix (16px minimum screen, 24px, 32px, 48px, 64px, 120px)
 * 5. Official Ping AR + LT Typography Showcase (Regular 400, Medium 500, Bold 700, Extra Bold 800)
 * 6. WCAG 2.2 AA / AAA Contrast Matrix
 * 7. Correct vs Prohibited Logo Usage Rules
 * 8. Core UI Primitives Harmonized with Official Brand Tokens
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
  RashxSymbol,
  RashxWordmark,
  RashxLockupBilingual,
  RashxMonogram,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  FileText,
  ShieldCheck,
} from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: 'RASHX | راش إكس — الهوية الرسمية المعتمدة ونظام التشغيل الرقمي',
    description:
      'الهوية البصرية الرسمية المعتمدة لشركة راش إكس (RASHX) — نظام التشغيل الرقمي المتكامل لصالونات التجميل ومراكز العناية والسبا في المملكة العربية السعودية.',
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
      {/* ── Top Corporate Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[--surface-border] bg-[--surface-card]/95 backdrop-blur-md">
        <PageContainer size="xl" className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <RashxLockupBilingual height={36} color="ink" />
              <span className="sr-only">{t.metadata.siteName}</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" size="sm" className="hidden sm:inline-flex border-[#54453D]/20 text-[#54453D]">
              {isAr ? 'الهوية الرسمية المعتمدة' : 'Official Approved Identity'}
            </Badge>
            <Link
              href={isAr ? '/?lang=en' : '/'}
              className="inline-flex items-center gap-1.5 rounded-md border border-[--surface-border] bg-white px-3 py-1.5 text-xs font-semibold text-[#54453D] shadow-xs hover:bg-[--surface-muted]"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </Link>
          </div>
        </PageContainer>
      </header>

      {/* ── Hero / Corporate Positioning ────────────────────────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border] bg-gradient-to-b from-[#FAF9F8] to-[#FFFFFF]">
        <PageContainer size="xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" size="md" className="border-[#54453D]/30 bg-white text-[#54453D]">
                {isAr ? 'التأسيس: 2026' : 'Founded: 2026'}
              </Badge>
              <Badge variant="secondary" size="md" className="bg-[#F0C5AE] text-[#54453D] font-medium">
                {isAr ? 'المؤسس: م. محمد عبده رشاد البهي' : 'Founder: Eng. Mohamed Abdo Rashad El-Bahy'}
              </Badge>
              <Badge variant="outline" size="md" className="border-[#91B8C0] bg-[#E4EEF0] text-[#2C4349]">
                {isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia · KSA'}
              </Badge>
            </div>

            <div className="my-8 flex justify-center">
              <div className="rounded-2xl border border-[#E8DFD8] bg-[#FAF9F8] p-8 shadow-sm">
                <RashxLockupBilingual height={64} color="ink" />
              </div>
            </div>

            <Typography variant="h1" className="font-extrabold tracking-tight text-[#54453D]">
              {isAr
                ? 'نظام التشغيل الرقمي لصالونات التجميل والعناية'
                : 'The Integrated Digital Operating System for Salons & Spas'}
            </Typography>

            <Typography variant="body-lg" color="muted" className="mx-auto mt-4 max-w-2xl text-[#75645B]">
              {isAr
                ? 'إدارة متكاملة، حجوزات، نقاط بيع، علاقات عملاء، وتحليلات تشغيلية متطورة مصممة خصيصاً لقطاع التجميل والاستجمام في المملكة العربية السعودية.'
                : 'Integrated operations, bookings, POS, CRM, staff administration, and operational analytics engineered for the Saudi beauty and wellness market.'}
            </Typography>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-[#54453D] text-white hover:bg-[#433730]">
                <span>{isAr ? 'طلب عرض توضيحي' : 'Request Demo'}</span>
                <ArrowIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="border-[#54453D] text-[#54453D] hover:bg-[#F0C5AE]/30">
                <span>{isAr ? 'تصفح مواصفات الهوية' : 'View Brand Specs'}</span>
              </Button>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section 1: Official Logo Marks & Variants ──────────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border]">
        <PageContainer size="xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#75645B]">
              <Sparkles className="h-4 w-4 text-[#C78360]" />
              <span>{isAr ? 'العلامات والشعارات الرسمية' : 'Official Brand Marks'}</span>
            </div>
            <Typography variant="h2" className="mt-1 font-bold text-[#54453D]">
              {isAr ? 'الشعارات المعتمدة بدقة المتجهات الأصلية' : 'Approved Logo Marks & Outlines'}
            </Typography>
            <Typography variant="body" color="muted" className="text-[#75645B]">
              {isAr
                ? 'جميع الشعارات مرسومة بمسارات متجهات صافية (Vector Paths) من حزمة الهوية الرسمية دون الاعتماد على خطوط خارجية.'
                : 'All marks are engineered as pure SVG paths from the official brand kit with zero external font dependencies.'}
            </Typography>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Bilingual Lockup Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E8DFD8] bg-[#FAF9F8] p-6 shadow-xs">
              <div>
                <Badge variant="outline" size="sm" className="mb-4 text-[#54453D]">
                  Bilingual Lockup
                </Badge>
                <div className="flex h-32 items-center justify-center">
                  <RashxLockupBilingual height={44} color="ink" />
                </div>
              </div>
              <div className="mt-4 border-t border-[#E8DFD8] pt-3 text-xs text-[#75645B]">
                <p className="font-semibold">{isAr ? 'الشعار المزدوج الرسمي' : 'Official Bilingual Lockup'}</p>
                <p>viewBox: 0 0 1233.1 340</p>
              </div>
            </div>

            {/* English Wordmark Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E8DFD8] bg-[#FAF9F8] p-6 shadow-xs">
              <div>
                <Badge variant="outline" size="sm" className="mb-4 text-[#54453D]">
                  English Wordmark
                </Badge>
                <div className="flex h-32 items-center justify-center">
                  <RashxWordmark variant="english" height={36} color="ink" />
                </div>
              </div>
              <div className="mt-4 border-t border-[#E8DFD8] pt-3 text-xs text-[#75645B]">
                <p className="font-semibold">{isAr ? 'شعار الكلمة الإنجليزي' : 'English Wordmark'}</p>
                <p>viewBox: 0 0 4549.3 1000</p>
              </div>
            </div>

            {/* Arabic Wordmark Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E8DFD8] bg-[#FAF9F8] p-6 shadow-xs">
              <div>
                <Badge variant="outline" size="sm" className="mb-4 text-[#54453D]">
                  Arabic Wordmark
                </Badge>
                <div className="flex h-32 items-center justify-center">
                  <RashxWordmark variant="arabic" height={34} color="ink" />
                </div>
              </div>
              <div className="mt-4 border-t border-[#E8DFD8] pt-3 text-xs text-[#75645B]">
                <p className="font-semibold">{isAr ? 'شعار الكلمة العربي' : 'Arabic Wordmark'}</p>
                <p>viewBox: 0 0 7706.8 1000</p>
              </div>
            </div>

            {/* Rx Symbol Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E8DFD8] bg-[#FAF9F8] p-6 shadow-xs">
              <div>
                <Badge variant="outline" size="sm" className="mb-4 text-[#54453D]">
                  Rx Brand Symbol
                </Badge>
                <div className="flex h-32 items-center justify-center">
                  <RashxSymbol size={54} color="ink" />
                </div>
              </div>
              <div className="mt-4 border-t border-[#E8DFD8] pt-3 text-xs text-[#75645B]">
                <p className="font-semibold">{isAr ? 'رمز Rx الرسمي' : 'Official Rx Symbol'}</p>
                <p>viewBox: 0 0 1048.8 1000</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section 2: Logo on Approved Backgrounds ────────────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border] bg-[#FAF9F8]/60">
        <PageContainer size="xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#75645B]">
              <Layers className="h-4 w-4 text-[#91B8C0]" />
              <span>{isAr ? 'تطبيقات الشعار على الألوان المعتمدة' : 'Logo on Approved Backgrounds'}</span>
            </div>
            <Typography variant="h2" className="mt-1 font-bold text-[#54453D]">
              {isAr ? 'التوافق اللوني والتباين المعتمد' : 'Contrast Pairing & Surface Verification'}
            </Typography>
            <Typography variant="body" color="muted" className="text-[#75645B]">
              {isAr
                ? 'وفقاً لإرشادات المؤسس: يظهر الشعار دائماً بلون Ink (#54453D) على الخلفيات الفاتحة، وبلون White (#FFFFFF) حصرياً على خلفية Ink.'
                : 'Per Founder guidelines: Logo is always Ink (#54453D) on light surfaces, and White (#FFFFFF) exclusively on Ink background.'}
            </Typography>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* On Warm Peach */}
            <div className="rounded-xl border border-[#E6D0C3] bg-[#F0C5AE] p-6 text-center shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#54453D]/70">On Warm Peach</span>
              <div className="my-6 flex h-24 items-center justify-center">
                <RashxSymbol size={48} color="ink" />
              </div>
              <div className="border-t border-[#54453D]/15 pt-3">
                <p className="text-xs font-semibold text-[#54453D]">Logo: Ink #54453D</p>
                <p className="text-[11px] text-[#54453D]/80">Contrast: 5.82:1 (Pass AA/AAA)</p>
              </div>
            </div>

            {/* On Dusty Blue */}
            <div className="rounded-xl border border-[#B5CBD0] bg-[#91B8C0] p-6 text-center shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#54453D]/70">On Dusty Blue</span>
              <div className="my-6 flex h-24 items-center justify-center">
                <RashxSymbol size={48} color="ink" />
              </div>
              <div className="border-t border-[#54453D]/15 pt-3">
                <p className="text-xs font-semibold text-[#54453D]">Logo: Ink #54453D</p>
                <p className="text-[11px] text-[#54453D]/80">Contrast: 4.31:1 (Pass 3:1 UI)</p>
              </div>
            </div>

            {/* On Soft Cream */}
            <div className="rounded-xl border border-[#E8DFD8] bg-[#FAF9F8] p-6 text-center shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#75645B]">On Soft Cream</span>
              <div className="my-6 flex h-24 items-center justify-center">
                <RashxSymbol size={48} color="ink" />
              </div>
              <div className="border-t border-[#E8DFD8] pt-3">
                <p className="text-xs font-semibold text-[#54453D]">Logo: Ink #54453D</p>
                <p className="text-[11px] text-[#75645B]">Contrast: 8.65:1 (Pass AAA)</p>
              </div>
            </div>

            {/* On Pure White */}
            <div className="rounded-xl border border-[#E8DFD8] bg-[#FFFFFF] p-6 text-center shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#75645B]">On Pure White</span>
              <div className="my-6 flex h-24 items-center justify-center">
                <RashxSymbol size={48} color="ink" />
              </div>
              <div className="border-t border-[#E8DFD8] pt-3">
                <p className="text-xs font-semibold text-[#54453D]">Logo: Ink #54453D</p>
                <p className="text-[11px] text-[#75645B]">Contrast: 9.04:1 (Pass AAA)</p>
              </div>
            </div>

            {/* On Brand Ink */}
            <div className="rounded-xl border border-[#433730] bg-[#54453D] p-6 text-center shadow-xs text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">On Brand Ink</span>
              <div className="my-6 flex h-24 items-center justify-center">
                <RashxSymbol size={48} color="white" />
              </div>
              <div className="border-t border-white/20 pt-3">
                <p className="text-xs font-semibold text-white">Logo: White #FFFFFF</p>
                <p className="text-[11px] text-white/80">Contrast: 9.04:1 (Pass AAA)</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section 3: Multi-Scale Resolution Matrix ───────────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border]">
        <PageContainer size="xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#75645B]">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <span>{isAr ? 'مصفوفة الأحجام والشاشات' : 'Size Scale & Legibility Verification'}</span>
            </div>
            <Typography variant="h2" className="mt-1 font-bold text-[#54453D]">
              {isAr ? 'وضوح الرمز عبر الأحجام من 16px إلى 120px' : 'Optical Legibility from 16px to 120px'}
            </Typography>
            <Typography variant="body" color="muted" className="text-[#75645B]">
              {isAr
                ? 'الحد الأدنى المعتمد للشاشات: 16px للرمز و 12px لشعار الكلمة، مما يضمن الوضوح التام في شريط المتصفح وتطبيقات الجوال.'
                : 'Minimum sizes: 16px for Rx symbol, 12px for wordmarks on screen (3mm for print).'}
            </Typography>
          </div>

          <div className="rounded-2xl border border-[#E8DFD8] bg-[#FAF9F8] p-8 shadow-xs">
            <div className="flex flex-wrap items-end justify-around gap-8 text-center">
              {/* 16px (Minimum Screen Size) */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#E8DFD8] bg-white p-2">
                  <RashxSymbol size={16} color="ink" />
                </div>
                <div className="text-xs font-medium text-[#54453D]">
                  <p className="font-bold">16px</p>
                  <p className="text-[10px] text-[#75645B]">{isAr ? 'الحد الأدنى' : 'Min Screen'}</p>
                </div>
              </div>

              {/* 24px */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#E8DFD8] bg-white p-2">
                  <RashxSymbol size={24} color="ink" />
                </div>
                <div className="text-xs font-medium text-[#54453D]">
                  <p className="font-bold">24px</p>
                  <p className="text-[10px] text-[#75645B]">Favicon / App</p>
                </div>
              </div>

              {/* 32px (Default UI) */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#E8DFD8] bg-white p-2">
                  <RashxSymbol size={32} color="ink" />
                </div>
                <div className="text-xs font-medium text-[#54453D]">
                  <p className="font-bold">32px</p>
                  <p className="text-[10px] text-[#75645B]">Header Bar</p>
                </div>
              </div>

              {/* 48px */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[#E8DFD8] bg-white p-2">
                  <RashxSymbol size={48} color="ink" />
                </div>
                <div className="text-xs font-medium text-[#54453D]">
                  <p className="font-bold">48px</p>
                  <p className="text-[10px] text-[#75645B]">Cards / UI</p>
                </div>
              </div>

              {/* 64px */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-[#E8DFD8] bg-white p-2">
                  <RashxSymbol size={64} color="ink" />
                </div>
                <div className="text-xs font-medium text-[#54453D]">
                  <p className="font-bold">64px</p>
                  <p className="text-[10px] text-[#75645B]">Hero / Covers</p>
                </div>
              </div>

              {/* 120px (Display) */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-[#E8DFD8] bg-white p-3">
                  <RashxSymbol size={110} color="ink" />
                </div>
                <div className="text-xs font-medium text-[#54453D]">
                  <p className="font-bold">120px</p>
                  <p className="text-[10px] text-[#75645B]">Billboard / Display</p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section 4: Official Typography (Ping AR + LT) ───────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border] bg-[#FAF9F8]/60">
        <PageContainer size="xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#75645B]">
                <FileText className="h-4 w-4 text-[#54453D]" />
                <span>{isAr ? 'الطباعة والخطوط الرسمية' : 'Official Typography Architecture'}</span>
              </div>
              <Typography variant="h2" className="mt-1 font-bold text-[#54453D]">
                Ping AR + LT — {isAr ? 'الأوزان الأربعة المعتمدة' : 'Official 4-Weight Matrix'}
              </Typography>
              <Typography variant="body" color="muted" className="text-[#75645B]">
                {isAr
                  ? 'الخط المعتمد رسمياً: Ping AR + LT بجميع أوزانه، مع حزمة بدائل متوافقة هندسياً للأجهزة التي لا يتوفر بها الخط.'
                  : 'Official corporate font: Ping AR + LT across all weights, with robust system fallbacks.'}
              </Typography>
            </div>
            <div className="rounded-lg border border-[#E8DFD8] bg-white px-4 py-2 text-xs text-[#75645B]">
              <span className="font-semibold text-[#54453D]">Fallback Stack:</span>{' '}
              <code className="text-[11px]">Ping AR + LT, Helvetica Neue, Arial, Noto Sans Arabic, Tahoma</code>
            </div>
          </div>

          <div className="space-y-4">
            {/* Regular 400 */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#E8DFD8] bg-white p-6 md:flex-row md:items-center">
              <div>
                <span className="text-xs font-bold uppercase text-[#75645B]">Regular 400 · Body & Paragraphs</span>
                <p className="mt-1 font-normal text-2xl text-[#54453D]">RASHX Aa Bb 0123</p>
              </div>
              <div className="text-start md:text-end">
                <p className="font-normal text-2xl text-[#54453D]" dir="rtl">
                  راش اكس أب جد ٠١٢٣
                </p>
                <p className="text-xs text-[#75645B] mt-1">{isAr ? 'نصوص المتن والفقرات' : 'Body Text & Editorial'}</p>
              </div>
            </div>

            {/* Medium 500 */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#E8DFD8] bg-white p-6 md:flex-row md:items-center">
              <div>
                <span className="text-xs font-bold uppercase text-[#75645B]">Medium 500 · Labels & UI</span>
                <p className="mt-1 font-medium text-2xl text-[#54453D]">RASHX Aa Bb 0123</p>
              </div>
              <div className="text-start md:text-end">
                <p className="font-medium text-2xl text-[#54453D]" dir="rtl">
                  راش اكس أب جد ٠١٢٣
                </p>
                <p className="text-xs text-[#75645B] mt-1">{isAr ? 'عناصر واجهة المستخدم والأزرار' : 'UI & Button Labels'}</p>
              </div>
            </div>

            {/* Bold 700 */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#E8DFD8] bg-white p-6 md:flex-row md:items-center">
              <div>
                <span className="text-xs font-bold uppercase text-[#75645B]">Bold 700 · Headlines & Names</span>
                <p className="mt-1 font-bold text-2xl text-[#54453D]">RASHX Aa Bb 0123</p>
              </div>
              <div className="text-start md:text-end">
                <p className="font-bold text-2xl text-[#54453D]" dir="rtl">
                  راش اكس أب جد ٠١٢٣
                </p>
                <p className="text-xs text-[#75645B] mt-1">{isAr ? 'العناوين الرئيسية وأسماء الأقسام' : 'Headlines & Section Titles'}</p>
              </div>
            </div>

            {/* Extra Bold 800 */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#E8DFD8] bg-white p-6 md:flex-row md:items-center">
              <div>
                <span className="text-xs font-bold uppercase text-[#75645B]">Extra Bold 800 · Display & Emphasis</span>
                <p className="mt-1 font-extrabold text-2xl text-[#54453D]">RASHX Aa Bb 0123</p>
              </div>
              <div className="text-start md:text-end">
                <p className="font-extrabold text-2xl text-[#54453D]" dir="rtl">
                  راش اكس أب جد ٠١٢٣
                </p>
                <p className="text-xs text-[#75645B] mt-1">{isAr ? 'عناوين الشاشات الكبرى والتركيز البصري' : 'Display & Hero Titles'}</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section 5: Brand Color Palette & Contrast Specs ────────── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border]">
        <PageContainer size="xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#75645B]">
              <Sparkles className="h-4 w-4 text-[#C78360]" />
              <span>{isAr ? 'الألوان الرسمية المعتمدة' : 'Official Color Swatches & Contrast'}</span>
            </div>
            <Typography variant="h2" className="mt-1 font-bold text-[#54453D]">
              {isAr ? 'القيم الدقيقة ونسب التباين WCAG 2.2' : 'Exact Hex Specifications & WCAG Ratios'}
            </Typography>
            <Typography variant="body" color="muted" className="text-[#75645B]">
              {isAr
                ? '5 ألوان أساسية تشكل الهوية الرسمية الكاملة لراش إكس. تباين لون الحبر Ink يفوق المعايير الدولية على جميع الأسطح.'
                : 'The 5 canonical brand colors. Ink (#54453D) achieves superior contrast across all approved surfaces.'}
            </Typography>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* Warm Peach */}
            <div className="overflow-hidden rounded-xl border border-[#E6D0C3] bg-white shadow-xs">
              <div className="h-32 bg-[#F0C5AE]" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#54453D]">Warm Peach</p>
                  <Badge variant="outline" size="sm" className="text-[10px] text-[#54453D]">Primary</Badge>
                </div>
                <code className="text-xs font-bold text-[#75645B]">#F0C5AE</code>
                <p className="mt-2 text-xs text-[#75645B]">
                  {isAr ? 'الخلفيات وبطاقات التمييز' : 'Backgrounds & primary cards'}
                </p>
                <div className="mt-3 rounded-md bg-[#FAF9F8] p-2 text-[11px] text-[#54453D]">
                  <p className="font-semibold">Ink contrast: 5.82:1</p>
                  <p className="text-[10px] text-[#15803D]">✓ Passes AA Normal / AAA Large</p>
                </div>
              </div>
            </div>

            {/* Dusty Blue */}
            <div className="overflow-hidden rounded-xl border border-[#B5CBD0] bg-white shadow-xs">
              <div className="h-32 bg-[#91B8C0]" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#54453D]">Dusty Blue</p>
                  <Badge variant="outline" size="sm" className="text-[10px] text-[#2C4349]">Secondary</Badge>
                </div>
                <code className="text-xs font-bold text-[#75645B]">#91B8C0</code>
                <p className="mt-2 text-xs text-[#75645B]">
                  {isAr ? 'التفاصيل وأشرطة العناوين' : 'Details & header cards'}
                </p>
                <div className="mt-3 rounded-md bg-[#FAF9F8] p-2 text-[11px] text-[#54453D]">
                  <p className="font-semibold">Ink contrast: 4.31:1</p>
                  <p className="text-[10px] text-[#15803D]">✓ Passes 3:1 UI & Large Text</p>
                </div>
              </div>
            </div>

            {/* White */}
            <div className="overflow-hidden rounded-xl border border-[#E8DFD8] bg-white shadow-xs">
              <div className="h-32 border-b border-[#E8DFD8] bg-[#FFFFFF]" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#54453D]">White</p>
                  <Badge variant="outline" size="sm" className="text-[10px] text-[#54453D]">Base 1</Badge>
                </div>
                <code className="text-xs font-bold text-[#75645B]">#FFFFFF</code>
                <p className="mt-2 text-xs text-[#75645B]">
                  {isAr ? 'الأسطح الصافية والحاويات' : 'Canvas & clean cards'}
                </p>
                <div className="mt-3 rounded-md bg-[#FAF9F8] p-2 text-[11px] text-[#54453D]">
                  <p className="font-semibold">Ink contrast: 9.04:1</p>
                  <p className="text-[10px] text-[#15803D]">✓ Passes AAA Highest Standard</p>
                </div>
              </div>
            </div>

            {/* Soft Cream */}
            <div className="overflow-hidden rounded-xl border border-[#E8DFD8] bg-white shadow-xs">
              <div className="h-32 bg-[#FAF9F8]" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#54453D]">Soft Cream</p>
                  <Badge variant="outline" size="sm" className="text-[10px] text-[#54453D]">Base 2</Badge>
                </div>
                <code className="text-xs font-bold text-[#75645B]">#FAF9F8</code>
                <p className="mt-2 text-xs text-[#75645B]">
                  {isAr ? 'الخلفيات الهادئة والبطاقات' : 'Soft surfaces & cards'}
                </p>
                <div className="mt-3 rounded-md bg-[#FAF9F8] p-2 text-[11px] text-[#54453D]">
                  <p className="font-semibold">Ink contrast: 8.65:1</p>
                  <p className="text-[10px] text-[#15803D]">✓ Passes AAA Highest Standard</p>
                </div>
              </div>
            </div>

            {/* Brand Ink */}
            <div className="overflow-hidden rounded-xl border border-[#433730] bg-white shadow-xs">
              <div className="h-32 bg-[#54453D]" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#54453D]">Brand Ink</p>
                  <Badge variant="outline" size="sm" className="text-[10px] text-[#54453D]">Logo / Text</Badge>
                </div>
                <code className="text-xs font-bold text-[#75645B]">#54453D</code>
                <p className="mt-2 text-xs text-[#75645B]">
                  {isAr ? 'لون الشعار وكل النصوص' : 'Logo & text color on all surfaces'}
                </p>
                <div className="mt-3 rounded-md bg-[#FAF9F8] p-2 text-[11px] text-[#54453D]">
                  <p className="font-semibold">White contrast: 9.04:1</p>
                  <p className="text-[10px] text-[#15803D]">✓ Passes AAA Inverted Standard</p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section 6: Brand Rules (Clear Space & Incorrect Usage) ── */}
      <SectionContainer spacing="lg" className="border-b border-[--surface-border] bg-[#FAF9F8]/60">
        <PageContainer size="xl">
          <div className="mb-8">
            <Typography variant="h2" className="font-bold text-[#54453D]">
              {isAr ? 'قواعد الاستخدام المعتمدة وحظر التشويه' : 'Usage Rules & Prohibited Alterations'}
            </Typography>
            <Typography variant="body" color="muted" className="text-[#75645B]">
              {isAr
                ? 'إرشادات ملزمة للحفاظ على نزاهة العلامة التجارية وتوحيد تمثيلها البصري في كافة الوسائط الرقمية والمطبوعة.'
                : 'Mandatory rules extracted from guidelines.svg to protect brand integrity across digital and print touchpoints.'}
            </Typography>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Approved Usage Rules */}
            <div className="rounded-xl border border-[#E8DFD8] bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#15803D]">
                <CheckCircle2 className="h-5 w-5" />
                <span>{isAr ? 'قواعد الاستخدام الصحيحة' : 'Approved Brand Standards'}</span>
              </div>
              <ul className="space-y-3 text-sm text-[#54453D]">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#C78360]">01.</span>
                  <span>
                    <strong>{isAr ? 'المساحة المحمية (Clear Space):' : 'Clear Space:'}</strong>{' '}
                    {isAr
                      ? 'الحفاظ دائماً على مسافة أمان حول الشعار تعادل ارتفاع ساق حرف R على الأقل.'
                      : 'Maintain clear space around the logo equal to the height of the R stem (0.5H).'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#C78360]">02.</span>
                  <span>
                    <strong>{isAr ? 'لون الشعار والنصوص:' : 'Logo & Text Color:'}</strong>{' '}
                    {isAr
                      ? 'الشعار والنصوص دائماً بلون Ink (#54453D) فوق خلفيات الخوخي والأزرق والكريم والأبيض.'
                      : 'Logo and text are always Ink (#54453D) over Peach, Blue, Cream, and White surfaces.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#C78360]">03.</span>
                  <span>
                    <strong>{isAr ? 'الحد الأدنى للحجم:' : 'Minimum Sizes:'}</strong>{' '}
                    {isAr
                      ? 'شعار الكلمة 12px على الشاشة (3 مم للطباعة)، والرمز 16px كحد أدنى.'
                      : 'Wordmark minimum 12px on screen (3mm print); Rx symbol minimum 16px.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#C78360]">04.</span>
                  <span>
                    <strong>{isAr ? 'شعار المواد العربية:' : 'Arabic Materials:'}</strong>{' '}
                    {isAr
                      ? 'استخدام شعار الكلمة العربي أو القفل المزدوج للمواد الموجهة باللغة العربية.'
                      : 'Use Arabic wordmark or bilingual lockup for Arabic-language communications.'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Prohibited Alterations */}
            <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 shadow-xs">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#DC2626]">
                <AlertTriangle className="h-5 w-5" />
                <span>{isAr ? 'الممارسات المحظورة تماماً' : 'Strictly Prohibited Practices'}</span>
              </div>
              <ul className="space-y-3 text-sm text-[#7F1D1D]">
                <li className="flex items-start gap-2">
                  <span className="font-bold">✕</span>
                  <span>
                    <strong>{isAr ? 'حظر تغيير الألوان:' : 'No Unauthorized Colors:'}</strong>{' '}
                    {isAr
                      ? 'يُحظر تلوين الشعار بالخوخي أو الأزرق أو أي لون غير Ink أو White.'
                      : 'Never color the logo mark in Peach, Blue, or any color other than Ink or White.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">✕</span>
                  <span>
                    <strong>{isAr ? 'حظر النص الأبيض على الخوخي أو الأزرق:' : 'No White Text on Peach or Blue:'}</strong>{' '}
                    {isAr
                      ? 'لا تستخدم نصاً أبيض فوق الخوخي أو الأزرق لضعف التباين (1.55:1 و 1.84:1).'
                      : 'Never place White text on Peach or Blue backgrounds due to failing WCAG contrast.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">✕</span>
                  <span>
                    <strong>{isAr ? 'حظر التمطيط أو التدوير:' : 'No Stretching or Rotation:'}</strong>{' '}
                    {isAr
                      ? 'يُمنع تغيير أبعاد الشعار أو تدويره أو إضافة ظلال وتأثيرات غير معتمدة.'
                      : 'Never alter aspect ratios, rotate angles, or add unapproved drop shadows.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">✕</span>
                  <span>
                    <strong>{isAr ? 'حظر استبدال الخط:' : 'No Font Replacement:'}</strong>{' '}
                    {isAr
                      ? 'يُحظر استبدال خط Ping AR + LT بخطوط أخرى في التصاميم المعتمدة.'
                      : 'Never replace Ping AR + LT with arbitrary non-brand typefaces.'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Section 7: Core UI Primitives Harmonized with Official Tokens */}
      <SectionContainer spacing="lg">
        <PageContainer size="xl">
          <div className="mb-8">
            <Typography variant="h2" className="font-bold text-[#54453D]">
              {isAr ? 'العناصر التفاعلية المنسجمة مع الهوية' : 'Interactive UI Components'}
            </Typography>
            <Typography variant="body" color="muted" className="text-[#75645B]">
              {isAr
                ? 'مكونات النظام البرمجي متوافقة تماماً مع معايير إمكانية الوصول WCAG 2.2 AA.'
                : 'Production-ready UI primitives fully synchronized with the official brand token system.'}
            </Typography>
          </div>

          <div className="space-y-6">
            {/* Buttons Row */}
            <div className="rounded-xl border border-[#E8DFD8] bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase text-[#75645B]">Button Variants</span>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md" className="bg-[#54453D] text-white hover:bg-[#433730]">
                  Primary Button
                </Button>
                <Button variant="secondary" size="md" className="bg-[#F0C5AE] text-[#54453D] hover:bg-[#E4A889]">
                  Secondary Button
                </Button>
                <Button variant="outline" size="md" className="border-[#54453D] text-[#54453D] hover:bg-[#F0C5AE]/20">
                  Outline Button
                </Button>
                <Button variant="ghost" size="md" className="text-[#54453D] hover:bg-[#FAF9F8]">
                  Ghost Button
                </Button>
                <Button variant="destructive" size="md">
                  Destructive
                </Button>
                <IconButton
                  aria-label={isAr ? 'تبديل اللغة' : 'Toggle Language'}
                  variant="outline"
                  size="md"
                  className="border-[#54453D] text-[#54453D]"
                  icon={<Globe className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Badges Row */}
            <div className="rounded-xl border border-[#E8DFD8] bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase text-[#75645B]">Badge Status Variants</span>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="brand" dot className="bg-[#54453D] text-white">Brand Active</Badge>
                <Badge variant="secondary" className="bg-[#F0C5AE] text-[#54453D]">Warm Peach</Badge>
                <Badge variant="outline" className="border-[#91B8C0] text-[#2C4349]">Dusty Blue</Badge>
                <Badge variant="success" dot>Operational</Badge>
                <Badge variant="warning" dot>Attention</Badge>
                <Badge variant="error" dot>Alert</Badge>
                <Badge variant="info" dot>System Info</Badge>
              </div>
            </div>

            <Separator />

            {/* Avatars & Monograms Row */}
            <div className="rounded-xl border border-[#E8DFD8] bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase text-[#75645B]">Avatars & Official Monograms</span>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Avatar alt="RASHX Avatar Large" fallback="RX" size="lg" className="border border-[#E8DFD8] bg-[#F0C5AE] text-[#54453D]" />
                <Avatar alt="RASHX Avatar Medium" fallback="RX" size="md" className="border border-[#E8DFD8] bg-[#91B8C0] text-[#54453D]" />
                <Avatar alt="RASHX Avatar Small" fallback="RX" size="sm" className="border border-[#E8DFD8] bg-[#FAF9F8] text-[#54453D]" />
                <div className="flex items-center gap-2">
                  <RashxMonogram size={40} background="peach" />
                  <RashxMonogram size={40} background="blue" />
                  <RashxMonogram size={40} background="ink" />
                  <RashxMonogram size={40} background="cream" />
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Official Corporate Footer ───────────────────────────────── */}
      <footer className="border-t border-[#433730] bg-[#54453D] py-12 text-white">
        <PageContainer size="xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-4">
              <RashxLockupBilingual height={36} color="white" />
            </div>

            <div className="text-center text-xs text-white/80 md:text-end">
              <p className="font-semibold text-white">
                {isAr
                  ? 'راش إكس لتقنية المعلومات — المملكة العربية السعودية'
                  : 'RASHX Information Technology — Kingdom of Saudi Arabia'}
              </p>
              <p className="mt-1 text-white/60">
                {isAr
                  ? 'المؤسس: م. محمد عبده رشاد البهي · جميع الحقوق محفوظة © 2026'
                  : 'Founder: Eng. Mohamed Abdo Rashad El-Bahy · All rights reserved © 2026'}
              </p>
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}
