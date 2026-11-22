/**
 * RASHX — Why Choose Us Component Unit Test Suite
 *
 * Verifies:
 * - Proper SectionTitle reuse with watermark
 * - Arabic (RTL) and English (LTR) rendering
 * - Operational Transformation Anchor with comparison points
 * - All 3 Strategic Pillars (Operational Calm, Client Care, Saudi Market Fit)
 * - Bottom Reassurance Strip with all guarantee tokens
 * - Strict adherence to zero-border and zero-shadow visual architecture
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';

describe('RASHX — Why Choose Us Section Suite', () => {
  describe('Arabic (Default RTL) Mode', () => {
    it('renders exact Arabic section title and eyebrow via SectionTitle', () => {
      render(<WhyChooseUs lang="ar" />);

      expect(screen.getByText('لماذا RASHX؟')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'لأن إدارة صالونك تستحق تجربة أفضل.',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'بدل إهدار الوقت بين دفاتر المواعيد ورسائل الواتساب والتطبيقات المتفرقة، تجمع RASHX كافة تفاصيل نشاطك في منظومة واحدة تمنحك الوضوح والهدوء التشغيلي.'
        )
      ).toBeInTheDocument();
    });

    it('renders Arabic transformation anchor with comparison points and workflow pulse', () => {
      render(<WhyChooseUs lang="ar" />);

      // Anchor Badge & Heading
      expect(screen.getAllByText('التحول التشغيلي')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'منظومة واحدة متكاملة تغنيك عن تشتت الأدوات التقليدية',
        })[0]
      ).toBeInTheDocument();

      // Traditional points
      expect(screen.getAllByText('الطرق التقليدية المشتتة')[0]).toBeInTheDocument();
      expect(
        screen.getAllByText('دفاتر مواعيد ورقية معرضة للتداخل والضياع')[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByText('تنسيق يدوي مجهد للمواعيد ورسائل التذكير')[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByText('حساب يدوي معقد لعمولات الموظفات نهاية الشهر')[0]
      ).toBeInTheDocument();

      // RASHX points
      expect(screen.getAllByText('في منظومة RASHX المترابطة')[0]).toBeInTheDocument();
      expect(
        screen.getAllByText('تقويم سحابي فوري يمنع تعارض المواعيد آلياً')[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByText('تأكيد وتذكير تلقائي عبر واتساب يقلل الغياب')[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByText('احتساب فوري وشفاف للعمولات والورديات لكل جلسة')[0]
      ).toBeInTheDocument();

      // Live pulse
      expect(screen.getAllByText('تدفق عمل مترابط لحظة بلحظة')[0]).toBeInTheDocument();
      expect(screen.getAllByText('مواعيد مؤكدة')[0]).toBeInTheDocument();
      expect(screen.getAllByText('عميلات راضيات')[0]).toBeInTheDocument();
      expect(screen.getAllByText('فريق منظم')[0]).toBeInTheDocument();
    });

    it('renders all three Arabic strategic pillars', () => {
      render(<WhyChooseUs lang="ar" />);

      // Pillar 1: Calm Operations
      expect(screen.getAllByText('إدارة بلا مفاجآت')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'رؤية واضحة لكل ما يحدث في الصالون لحظة بلحظة',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('تتبع فوري · منع التعارض')[0]).toBeInTheDocument();

      // Pillar 2: Client Care
      expect(screen.getAllByText('علاقات العميلات')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'سجل رقمي موحد يبني ولاء حقيقي مع كل زيارة',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('سجل الزيارات · التفضيلات الشخصية')[0]).toBeInTheDocument();

      // Pillar 3: Saudi Market Fit
      expect(screen.getAllByText('السوق السعودي')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'متوافقة بالكامل مع طبيعة ونشاط الصالونات المحلية',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('أرقام +966 · عملة ر.س · فروع متعددة')[0]).toBeInTheDocument();
    });

    it('renders Arabic reassurance strip with all guarantee items', () => {
      render(<WhyChooseUs lang="ar" />);

      expect(
        screen.getAllByRole('heading', {
          level: 4,
          name: 'نظام يعمل بهدوء في الخلفية لتتفرغ لنمو صالونك',
        })[0]
      ).toBeInTheDocument();

      expect(
        screen.getAllByText(
          'بدون تعقيد تقني وبدون عقود ملزمة، مع دعم مباشر وتدريب متكامل لفريق عملك من اليوم الأول.'
        )[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('دعم وتدريب مباشر للفريق')[0]).toBeInTheDocument();
      expect(screen.getAllByText('بيانات مشفرة ومعزولة لكل صالون')[0]).toBeInTheDocument();
      expect(screen.getAllByText('جاهزية تشغيل فورية بدون تجهيزات')[0]).toBeInTheDocument();
    });

    it('enforces RTL direction on the section root', () => {
      const { container } = render(<WhyChooseUs lang="ar" />);
      const section = container.querySelector('#why-choose-us');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English (?lang=en LTR) Mode', () => {
    it('renders exact English section title and eyebrow via SectionTitle', () => {
      render(<WhyChooseUs lang="en" />);

      expect(screen.getByText('WHY RASHX?')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Your salon deserves a better way to operate.',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Instead of juggling paper notebooks, scattered chats, and disconnected apps, RASHX brings your entire salon workflow into one coherent system built for clarity and control.'
        )
      ).toBeInTheDocument();
    });

    it('renders English transformation anchor, comparison, and pillars', () => {
      render(<WhyChooseUs lang="en" />);

      // Anchor
      expect(screen.getAllByText('OPERATIONAL TRANSFORMATION')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'One connected system replacing fragmented traditional tools',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('Fragmented Traditional Methods')[0]).toBeInTheDocument();
      expect(
        screen.getAllByText('Paper appointment logbooks prone to double-bookings')[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('The Connected RASHX System')[0]).toBeInTheDocument();
      expect(
        screen.getAllByText('Live cloud calendar preventing overlaps automatically')[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('Continuous real-time workflow')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Confirmed Bookings')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Delighted Clients')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Organized Team')[0]).toBeInTheDocument();

      // Pillars
      expect(screen.getAllByText('CALM OPERATIONS')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Live visibility into salon activities as they happen',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('CLIENT RELATIONSHIPS')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'A unified client record that builds lasting loyalty',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('SAUDI MARKET FIT')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Built specifically for local beauty business requirements',
        })[0]
      ).toBeInTheDocument();

      // Reassurance
      expect(
        screen.getAllByRole('heading', {
          level: 4,
          name: 'A quiet backend system so you can focus on salon growth',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('Direct team onboarding & training')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Encrypted & tenant-isolated salon data')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Instant setup with zero hardware lock')[0]).toBeInTheDocument();
    });

    it('enforces LTR direction on the section root', () => {
      const { container } = render(<WhyChooseUs lang="en" />);
      const section = container.querySelector('#why-choose-us');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Strict Zero Borders and Zero Shadows Compliance', () => {
    it('ensures section and all internal cards do not use decorative shadows or borders', () => {
      const { container } = render(<WhyChooseUs lang="ar" />);

      const section = container.querySelector('#why-choose-us');
      expect(section?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(section?.className).not.toMatch(/\bborder\b/);

      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);

      articles.forEach((art) => {
        expect(art.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(art.className).not.toMatch(/\bborder\b/);
      });
    });
  });
});

