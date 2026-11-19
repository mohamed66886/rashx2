/**
 * RASHX — Testimonials & Experience Section
 *
 * Server Component compatible (no 'use client').
 * Flat design only: zero borders, zero shadows, zero gradients.
 * Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D (+ existing #75645B, #C78360, #2C4349)
 *
 * Policy Compliance:
 *  - Factual Integrity: No fabricated reviews, fake quotes, or imaginary salon endorsements.
 *  - Extensible Architecture: When real verified testimonials are added to `REAL_TESTIMONIALS`,
 *    the section immediately renders them without layout rewrites.
 *  - Experience Fallback (Current State): Renders authentic RASHX experience principles and
 *    practical salon UX values with the exact required copy:
 *    AR: "تجربة إدارة أكثر وضوحًا." | EN: "A clearer way to manage your salon."
 */

import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import {
  Sparkles,
  HeartHandshake,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from '@rashx/icons';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';

export interface TestimonialsProps {
  lang: Lang;
  className?: string;
}

/**
 * Data model for verified salon customer testimonials.
 * Empty by default to respect RASHX content integrity policy until verified customer permissions are obtained.
 */
export interface VerifiedTestimonial {
  id: string;
  quote: {
    ar: string;
    en: string;
  };
  author: {
    ar: string;
    en: string;
  };
  role: {
    ar: string;
    en: string;
  };
  salon: {
    ar: string;
    en: string;
  };
  city?: {
    ar: string;
    en: string;
  };
}

/**
 * Source of truth for verified testimonials.
 * Strictly empty until written founder/customer authorization is provided.
 */
export const VERIFIED_TESTIMONIALS: VerifiedTestimonial[] = [];

export function Testimonials({ lang, className }: TestimonialsProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const exploreHref = (isAr ? '/brand' : '/brand?lang=en') as Route;

  const hasRealTestimonials = VERIFIED_TESTIMONIALS.length > 0;

  const content = isAr
    ? {
        eyebrow: 'تجربة RASHX',
        title: 'تجربة إدارة أكثر وضوحًا.',
        subtitle:
          'صُممت الواجهة لتكون سهلة ومريحة لكل من في الصالون، من الاستقبال إلى الإدارة، لتتحول المهام اليومية المعقدة إلى خطوات بسيطة ومنظمة.',
        heroQuote: {
          badge: 'الهدوء البصري وسرعة الاستقبال',
          quote:
            'واجهة صالونك يجب ألا تكون مصدراً إضافياً للتوتر. صممنا كل شاشة في RASHX لتُظهر فقط ما تحتاجه في اللحظة المناسبة، بدون تعقيد، ليبقى تركيز فريقك على إكرام العميلات وتقديم أفضل خدمة.',
          highlight: 'مبدأ RASHX: تبسيط التشغيل ليتفرغ الفريق لخدمة العميلات',
          steps: [
            'استقبال وتسجيل الحجز في ثوانٍ معدودة',
            'إشعار فوري للأخصائية ببدء الجلسة',
            'إصدار الفاتورة وإغلاق الحساب بلمسة واحدة',
          ],
        },
        cards: [
          {
            icon: HeartHandshake,
            badge: 'تجربة فريق العمل',
            quote:
              'لا تحتاج الأخصائية إلى تدريب طويل أو قراءة كتيبات معقدة؛ جدول المواعيد متاح على جوالها بوضوح، مع معرفة تفاصيل الخدمة والوقت بدقة متناهية.',
            roleTag: 'واجهة واضحة لجميع أعضاء الفريق',
            tone: 'bg-[#91B8C0]/25 text-[#2C4349]',
          },
          {
            icon: MessageSquare,
            badge: 'رؤية الإدارة والتحكم',
            quote:
              'راحة البال تبدأ عندما تتابع أداء الفروع وحركة المبيعات ونسب الإشغال في ثوانٍ، دون الحاجة للاتصال المتكرر بموظفي الاستقبال للتأكد من سير العمل.',
            roleTag: 'متابعة لحظية بدون مجهود مكرر',
            tone: 'bg-[#F0C5AE] text-[#54453D]',
          },
        ],
        ctaBanner: {
          title: 'جرب تجربة RASHX بنفسك واكتشف الفرق التشغيلي',
          description:
            'نؤمن بأن التجربة المباشرة هي أصدق مقياس لجودة المنظومة وسهولة استخدامها اليومي.',
          buttonText: 'استكشف أدوات المنصة',
        },
      }
    : {
        eyebrow: 'THE RASHX EXPERIENCE',
        title: 'A clearer way to manage your salon.',
        subtitle:
          'Thoughtfully designed to feel intuitive and calm for everyone in your salon, turning complex operational routines into effortless, clear workflows.',
        heroQuote: {
          badge: 'VISUAL CALM & FRONT DESK SPEED',
          quote:
            'Your salon software should never be a source of daily stress. We crafted every screen in RASHX to surface only what matters at the right moment, keeping your team focused on exceptional client care.',
          highlight: 'The RASHX Principle: Streamlining ops so your team thrives',
          steps: [
            'Check in appointments in seconds',
            'Automated specialist notification on session start',
            'One-tap checkout and receipt generation',
          ],
        },
        cards: [
          {
            icon: HeartHandshake,
            badge: 'STAFF EXPERIENCE',
            quote:
              'Specialists need zero training manuals; their schedule is clearly visible on their phone with exact treatment durations, notes, and preferences.',
            roleTag: 'Intuitive for every staff specialist',
            tone: 'bg-[#91B8C0]/25 text-[#2C4349]',
          },
          {
            icon: MessageSquare,
            badge: 'MANAGEMENT INSIGHT',
            quote:
              'Peace of mind begins when you can track branch performance, occupancy rates, and daily sales in seconds, without constant check-in calls to front desks.',
            roleTag: 'Real-time visibility without micromanagement',
            tone: 'bg-[#F0C5AE] text-[#54453D]',
          },
        ],
        ctaBanner: {
          title: 'Experience RASHX firsthand and discover the difference',
          description:
            'We believe direct hands-on experience is the truest measure of system quality and daily ease of use.',
          buttonText: 'Explore Platform Tools',
        },
      };

  return (
    <section
      id="testimonials"
      className={`bg-[#FAF9F8] py-16 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ── Section Header ────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={content.eyebrow}
            title={content.title}
            align="center"
            withWordmark
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
            {content.subtitle}
          </p>
        </div>

        {/* ── Content Stage ─────────────────────────────────────── */}
        {hasRealTestimonials ? (
          /* Render Verified Testimonials when available */
          <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VERIFIED_TESTIMONIALS.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-7"
              >
                <blockquote className="text-base sm:text-lg leading-relaxed text-[#54453D]">
                  «{isAr ? item.quote.ar : item.quote.en}»
                </blockquote>
                <div className="mt-6 pt-4">
                  <div className="font-bold text-[#54453D]">
                    {isAr ? item.author.ar : item.author.en}
                  </div>
                  <div className="text-xs text-[#75645B]">
                    {isAr ? item.role.ar : item.role.en} · {isAr ? item.salon.ar : item.salon.en}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Render Authentic Experience Principles (Case 2: No Fabricated Data) */
          <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-stretch">
            {/* ── Primary Editorial Quote Spotlight (7 cols) ───── */}
            <article className="flex flex-col justify-between rounded-[2rem] bg-white p-7 sm:p-9 lg:col-span-7 lg:p-11">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#54453D]">
                  <Sparkles className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
                  <span>{content.heroQuote.badge}</span>
                </div>

                {/* Decorative Quotation Mark */}
                <div
                  className="mt-6 text-4xl sm:text-5xl font-serif text-[#C78360]/40 select-none"
                  aria-hidden="true"
                >
                  “
                </div>

                <blockquote className="mt-2 text-xl sm:text-2xl font-bold leading-relaxed text-[#54453D]">
                  «{content.heroQuote.quote}»
                </blockquote>

                {/* Flat Experience Micro-Steps */}
                <div className="mt-8 space-y-2.5 rounded-2xl bg-[#FAF9F8] p-5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#75645B]">
                    {isAr ? 'تجربة العمل اليومية السلسة' : 'Seamless Daily Salon Flow'}
                  </span>
                  <ul className="space-y-2">
                    {content.heroQuote.steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-[#54453D]"
                      >
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-[#2C4349]"
                          aria-hidden="true"
                        />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#FAF9F8] px-3.5 py-2 text-xs font-semibold text-[#54453D]">
                  <span className="h-2 w-2 rounded-full bg-[#91B8C0]" />
                  <span>{content.heroQuote.highlight}</span>
                </span>
              </div>
            </article>

            {/* ── Secondary Editorial Cards (5 cols) ───────────── */}
            <div className="flex flex-col justify-between gap-6 lg:col-span-5">
              {content.cards.map((card, idx) => {
                const CardIcon = card.icon;
                return (
                  <article
                    key={idx}
                    className="flex flex-1 flex-col justify-between rounded-2xl bg-white p-6 sm:p-7"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                        >
                          <CardIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="rounded-full bg-[#FAF9F8] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#75645B]">
                          {card.badge}
                        </span>
                      </div>

                      <blockquote className="mt-5 text-base sm:text-lg leading-relaxed text-[#54453D]">
                        «{card.quote}»
                      </blockquote>
                    </div>

                    <div className="mt-6 pt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#FAF9F8] px-3 py-1.5 text-xs font-medium text-[#75645B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                        <span>{card.roleTag}</span>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Bottom Hands-on Invitation Banner ─────────────────── */}
        <div className="mt-8 sm:mt-10 rounded-2xl bg-white p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center sm:text-start">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#54453D]">
              {content.ctaBanner.title}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-[#75645B] leading-relaxed">
              {content.ctaBanner.description}
            </p>
          </div>

          <Link
            href={exploreHref}
            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F0C5AE] px-6 py-3 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
          >
            <span>{content.ctaBanner.buttonText}</span>
            <ArrowIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}

