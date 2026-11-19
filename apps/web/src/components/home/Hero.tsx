'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { ArrowRight, ArrowLeft } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface HeroProps {
  lang: Lang;
  className?: string;
}

const ICONS = {
  hug: '/emoji/hug.svg',
  grin: '/emoji/grin.svg',
  money: '/emoji/money.svg',
} as const;

const ITEM_H = 1.5; // em — لازم يساوي h-[1.5em]
const SLIDE_MS = 500;
const INTERVAL_MS = 2400;

export function Hero({ lang, className }: HeroProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const exploreHref = (isAr ? '/brand' : '/brand?lang=en') as Route;
  const contactHref = 'mailto:hello@rashx.com';

  const benefits: Array<{ text: string; icon: string }> = isAr
    ? [
        { text: 'راحة', icon: ICONS.hug },
        { text: 'سرعة', icon: ICONS.grin },
        { text: 'تحكّم', icon: ICONS.hug },
        { text: 'نمو', icon: ICONS.money },
        { text: 'تنظيم', icon: ICONS.grin },
        { text: 'أرباح', icon: ICONS.money },
      ]
    : [
        { text: 'Peace', icon: ICONS.hug },
        { text: 'Speed', icon: ICONS.grin },
        { text: 'Control', icon: ICONS.hug },
        { text: 'Growth', icon: ICONS.money },
        { text: 'Order', icon: ICONS.grin },
        { text: 'Profit', icon: ICONS.money },
      ];

  // Extended with the first item cloned at the end for an infinite upward transition loop
  const extendedBenefits = [...benefits, benefits[0]!];

  const [index, setIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // التقدّم كل 2.4 ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setTransitionEnabled(true);
      setIndex((prev) => (prev >= benefits.length ? 1 : prev + 1));
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [benefits.length]);

  // لما نوصل للنسخة المكررة (آخر عنصر) نرجع للأول بدون أنيميشن
  useEffect(() => {
    if (index !== benefits.length) return;

    const t = setTimeout(() => {
      setTransitionEnabled(false);
      setIndex(0);
    }, SLIDE_MS + 50);

    return () => clearTimeout(t);
  }, [index, benefits.length]);

  const activeBenefit = benefits[index % benefits.length] ?? benefits[0]!;

  return (
    <section
      id="hero"
      className={`relative overflow-hidden bg-gradient-to-b from-[#FAF9F8] to-[#FFFFFF] py-16 sm:py-20 lg:py-28 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="xl">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Main Animated Heading - Strictly single line (side by side) */}
          <h1 className="flex flex-nowrap items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold tracking-tight text-[#54453D] leading-none whitespace-nowrap">
            <span className="shrink-0">
              {isAr ? (
                <>
                  <span>تحصل مع </span>
                  <span className="relative inline-block">
                    <span className="relative z-10">راش إكس</span>
                    <svg
                      className="absolute -bottom-2 sm:-bottom-3 start-0 w-full overflow-visible pointer-events-none"
                      viewBox="0 0 165 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M3 10 C 25 3, 50 13, 80 6 C 110 0, 138 11, 162 5"
                        stroke="#91B8C0"
                        strokeWidth="4"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                  <span> على:</span>
                </>
              ) : (
                <>
                  <span>With </span>
                  <span className="relative inline-block">
                    <span className="relative z-10">RASHX</span>
                    <svg
                      className="absolute -bottom-2 sm:-bottom-3 start-0 w-full overflow-visible pointer-events-none"
                      viewBox="0 0 165 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M3 10 C 25 3, 50 13, 80 6 C 110 0, 138 11, 162 5"
                        stroke="#91B8C0"
                        strokeWidth="4"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                  <span>, you get:</span>
                </>
              )}
            </span>
            <span
              className="relative inline-flex h-[1.5em] items-start overflow-hidden text-[#C78360] shrink-0"
              aria-hidden="true"
            >
              <span
                className="flex shrink-0 flex-col motion-reduce:transition-none"
                style={{
                  transform: `translateY(-${index * ITEM_H}em)`,
                  transition: transitionEnabled
                    ? `transform ${SLIDE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
                    : 'none',
                }}
              >
                {extendedBenefits.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex h-[1.5em] items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className="h-[1em] w-[1em] shrink-0 select-none"
                    />
                    <span>{item.text}</span>
                  </span>
                ))}
              </span>
            </span>
            {/* Screen Reader Accessible Live Text */}
            <span className="sr-only">
              {isAr
                ? `تحصل مع راش إكس على: ${activeBenefit.text}`
                : `With RASHX, you get: ${activeBenefit.text}`}
            </span>
          </h1>

          {/* Value Proposition Description */}
          <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-[#75645B]">
            {isAr
              ? 'RASHX منظومة رقمية متكاملة تجمع إدارة المواعيد والعملاء والموظفين والخدمات والمبيعات في مكان واحد، لتمنحك تحكمًا أكبر وتجربة أفضل لعملائك.'
              : 'RASHX brings appointments, customers, staff, services, and sales together in one integrated platform, giving you greater control and a better customer experience.'}
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 sm:mt-10 flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={exploreHref}
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{isAr ? 'اكتشف المنصة' : 'Explore the Platform'}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href={contactHref}
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-xl bg-[#91B8C0] px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{isAr ? 'تواصل معنا' : 'Contact Us'}</span>
            </a>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}