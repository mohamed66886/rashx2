import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Phone,
  Globe,
  ExternalLink,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Send,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface DirectContactProps {
  lang: Lang;
  className?: string;
}

export function DirectContact({ lang, className }: DirectContactProps) {
  const isAr = lang === 'ar';

  const content = isAr
    ? {
        eyebrow: 'قنوات التواصل المباشرة',
        title: 'طرق التواصل المعتمدة مع فريق RASHX',
        subtitle:
          'يمكنك التواصل معنا مباشرة عبر الهاتف أو متابعة حساباتنا الرسمية الموثقة على المنصات الرقمية.',
        phoneCard: {
          label: 'الاتصال الهاتفي المباشر',
          number: '+966 54 808 2945',
          href: 'tel:+966548082945',
          description: 'خط التواصل المباشر للاستفسارات العامة والمؤسسية في المملكة.',
          cta: 'اتصل الآن',
        },
        socialSectionTitle: 'المنصات الرقمية وحسابات التواصل المعتمدة',
        channels: [
          {
            name: 'الموقع الرسمي',
            handle: 'rashx.org',
            href: 'https://rashx.org',
            icon: Globe,
          },
          {
            name: 'قناة تيليجرام',
            handle: '@rashxsa',
            href: 'https://t.me/rashxsa',
            icon: Send,
          },
          {
            name: 'منصة إكس (تويتر)',
            handle: '@rashxsa',
            href: 'https://x.com/rashxsa',
            icon: Twitter,
          },
          {
            name: 'لينكدإن',
            handle: 'company/rashx',
            href: 'https://www.linkedin.com/company/rashx',
            icon: Linkedin,
          },
          {
            name: 'إنستغرام',
            handle: '@rashx.sa',
            href: 'https://www.instagram.com/rashx.sa',
            icon: Instagram,
          },
          {
            name: 'تيك توك',
            handle: '@rashx.sa',
            href: 'https://www.tiktok.com/@rashx.sa',
            icon: ExternalLink,
          },
          {
            name: 'سناب شات',
            handle: 'rashx.sa',
            href: 'https://snapchat.com/t/MuwsbAAK',
            icon: ExternalLink,
          },
          {
            name: 'فيسبوك',
            handle: 'rashx.sa',
            href: 'https://www.facebook.com/rashx.sa',
            icon: Facebook,
          },
        ],
      }
    : {
        eyebrow: 'DIRECT CHANNELS',
        title: 'Official Ways to Connect with RASHX',
        subtitle:
          'Reach out directly by phone or follow our verified official presence across digital platforms.',
        phoneCard: {
          label: 'Direct Telephone Contact',
          number: '+966 54 808 2945',
          href: 'tel:+966548082945',
          description: 'Direct telephone line for operational and platform inquiries across the Kingdom.',
          cta: 'Call Now',
        },
        socialSectionTitle: 'Verified Digital & Social Presence',
        channels: [
          {
            name: 'Official Website',
            handle: 'rashx.org',
            href: 'https://rashx.org',
            icon: Globe,
          },
          {
            name: 'Telegram Channel',
            handle: '@rashxsa',
            href: 'https://t.me/rashxsa',
            icon: Send,
          },
          {
            name: 'X (Twitter)',
            handle: '@rashxsa',
            href: 'https://x.com/rashxsa',
            icon: Twitter,
          },
          {
            name: 'LinkedIn',
            handle: 'company/rashx',
            href: 'https://www.linkedin.com/company/rashx',
            icon: Linkedin,
          },
          {
            name: 'Instagram',
            handle: '@rashx.sa',
            href: 'https://www.instagram.com/rashx.sa',
            icon: Instagram,
          },
          {
            name: 'TikTok',
            handle: '@rashx.sa',
            href: 'https://www.tiktok.com/@rashx.sa',
            icon: ExternalLink,
          },
          {
            name: 'Snapchat',
            handle: 'rashx.sa',
            href: 'https://snapchat.com/t/MuwsbAAK',
            icon: ExternalLink,
          },
          {
            name: 'Facebook',
            handle: 'rashx.sa',
            href: 'https://www.facebook.com/rashx.sa',
            icon: Facebook,
          },
        ],
      };

  return (
    <section
      id="direct-contact"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={content.eyebrow}
            title={content.title}
            align="center"
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
            {content.subtitle}
          </p>
        </div>

        {/* Primary Phone Card (Flat Tonal Card, Zero Borders, Zero Shadows) */}
        <div className="mt-12 sm:mt-16 mx-auto max-w-2xl">
          <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#C78360]">
              <Phone className="h-7 w-7" aria-hidden="true" />
            </div>

            <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-[#75645B]">
              {content.phoneCard.label}
            </h3>

            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#54453D] font-mono dir-ltr">
              {content.phoneCard.number}
            </p>

            <p className="mt-3 text-sm leading-relaxed text-[#75645B] max-w-md mx-auto">
              {content.phoneCard.description}
            </p>

            <div className="mt-6">
              <a
                href={content.phoneCard.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>{content.phoneCard.cta}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Digital & Social Channels Grid */}
        <div className="mt-16">
          <h3 className="text-center text-sm font-bold text-[#54453D] mb-8">
            {content.socialSectionTitle}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {content.channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl bg-[#FAF9F8] p-5 flex flex-col items-center text-center transition-colors duration-200 hover:bg-[#F0C5AE]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
                  aria-label={`${channel.name} - ${channel.handle}`}
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#54453D] transition-transform duration-200 group-hover:scale-110">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="mt-3 text-xs font-bold text-[#54453D]">
                    {channel.name}
                  </span>
                  <span className="mt-0.5 text-[11px] text-[#75645B] font-mono dir-ltr">
                    {channel.handle}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

