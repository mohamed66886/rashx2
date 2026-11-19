/**
 * RASHX Root Layout
 *
 * Responsibilities:
 * - Font loading (Arabic + Latin via next/font)
 * - Language detection and HTML dir/lang attributes
 * - Root metadata
 * - Global CSS
 * - Provider wrapping (Phase 3 will add navigation shell)
 */

import type { Metadata } from 'next';
import { Noto_Kufi_Arabic, Inter } from 'next/font/google';
import { getLang, getDir, getLangAttr } from '@/lib/lang';
import { generateRootMetadata } from '@/lib/metadata';
import { BrandLoader } from '@rashx/ui';
import './globals.css';

// ── Arabic Font (Noto Kufi Arabic) ─────────────────────────
const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-arabic',
  display: 'swap',
  preload: true,
});

// ── Latin Font (Inter) ─────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-latin',
  display: 'swap',
  preload: false, // Arabic is default; lazy-load Latin
});

export const metadata: Metadata = generateRootMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  const dir = getDir(lang);
  const langAttr = getLangAttr(lang);

  return (
    <html
      lang={langAttr}
      dir={dir}
      className={`${notoKufiArabic.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-[--surface-background] text-[--surface-foreground]">
        {/* Official Brand Splash Curtain Loader */}
        <BrandLoader lang={lang} />

        {/* Skip to main content — accessibility */}
        <a href="#main-content" className="skip-link">
          {lang === 'ar' ? 'الانتقال إلى المحتوى الرئيسي' : 'Skip to main content'}
        </a>

        {/* Phase 3: SiteHeader will be added here */}

        <main id="main-content" tabIndex={-1}>
          {children}
        </main>

        {/* Phase 3: SiteFooter will be added here */}
        {/* Phase 3: CookieConsent will be added here */}
      </body>
    </html>
  );
}
