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
      expect(screen.getByText('التحول التشغيلي')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'منظومة واحدة متكاملة تغنيك عن تشتت الأدوات التقليدية',
        })
      ).toBeInTheDocument();

      // Traditional points
      expect(screen.getByText('الطرق التقليدية المشتتة')).toBeInTheDocument();
      expect(
        screen.getByText('دفاتر مواعيد ورقية معرضة للتداخل والضياع')
      ).toBeInTheDocument();
      expect(
        screen.getByText('تنسيق يدوي مجهد للمواعيد ورسائل التذكير')
      ).toBeInTheDocument();
      expect(
        screen.getByText('حساب يدوي معقد لعمولات الموظفات نهاية الشهر')
      ).toBeInTheDocument();

      // RASHX points
      expect(screen.getByText('في منظومة RASHX المترابطة')).toBeInTheDocument();
      expect(
        screen.getByText('تقويم سحابي فوري يمنع تعارض المواعيد آلياً')
      ).toBeInTheDocument();
      expect(
        screen.getByText('تأكيد وتذكير تلقائي عبر واتساب يقلل الغياب')
      ).toBeInTheDocument();
      expect(
        screen.getByText('احتساب فوري وشفاف للعمولات والورديات لكل جلسة')
      ).toBeInTheDocument();

      // Live pulse
      expect(screen.getByText('تدفق عمل مترابط لحظة بلحظة')).toBeInTheDocument();
      expect(screen.getAllByText('مواعيد مؤكدة')[0]).toBeInTheDocument();
      expect(screen.getAllByText('عميلات راضيات')[0]).toBeInTheDocument();
      expect(screen.getAllByText('فريق منظم')[0]).toBeInTheDocument();
    });

    it('renders all three Arabic strategic pillars', () => {
      render(<WhyChooseUs lang="ar" />);

      // Pillar 1: Calm Operations
      expect(screen.getByText('إدارة بلا مفاجآت')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'رؤية واضحة لكل ما يحدث في الصالون لحظة بلحظة',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('تتبع فوري · منع التعارض')).toBeInTheDocument();

      // Pillar 2: Client Care
      expect(screen.getByText('علاقات العميلات')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'سجل رقمي موحد يبني ولاء حقيقي مع كل زيارة',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('سجل الزيارات · التفضيلات الشخصية')).toBeInTheDocument();

      // Pillar 3: Saudi Market Fit
      expect(screen.getByText('السوق السعودي')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'متوافقة بالكامل مع طبيعة ونشاط الصالونات المحلية',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('أرقام +966 · عملة ر.س · فروع متعددة')).toBeInTheDocument();
    });

    it('renders Arabic reassurance strip with all guarantee items', () => {
      render(<WhyChooseUs lang="ar" />);

      expect(
        screen.getByRole('heading', {
          level: 4,
          name: 'نظام يعمل بهدوء في الخلفية لتتفرغ لنمو صالونك',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'بدون تعقيد تقني وبدون عقود ملزمة، مع دعم مباشر وتدريب متكامل لفريق عملك من اليوم الأول.'
        )
      ).toBeInTheDocument();

      expect(screen.getByText('دعم وتدريب مباشر للفريق')).toBeInTheDocument();
      expect(screen.getByText('بيانات مشفرة ومعزولة لكل صالون')).toBeInTheDocument();
      expect(screen.getByText('جاهزية تشغيل فورية بدون تجهيزات')).toBeInTheDocument();
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
      expect(screen.getByText('OPERATIONAL TRANSFORMATION')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'One connected system replacing fragmented traditional tools',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('Fragmented Traditional Methods')).toBeInTheDocument();
      expect(
        screen.getByText('Paper appointment logbooks prone to double-bookings')
      ).toBeInTheDocument();

      expect(screen.getByText('The Connected RASHX System')).toBeInTheDocument();
      expect(
        screen.getByText('Live cloud calendar preventing overlaps automatically')
      ).toBeInTheDocument();

      expect(screen.getByText('Continuous real-time workflow')).toBeInTheDocument();
      expect(screen.getAllByText('Confirmed Bookings')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Delighted Clients')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Organized Team')[0]).toBeInTheDocument();

      // Pillars
      expect(screen.getByText('CALM OPERATIONS')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Live visibility into salon activities as they happen',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('CLIENT RELATIONSHIPS')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'A unified client record that builds lasting loyalty',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('SAUDI MARKET FIT')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Built specifically for local beauty business requirements',
        })
      ).toBeInTheDocument();

      // Reassurance
      expect(
        screen.getByRole('heading', {
          level: 4,
          name: 'A quiet backend system so you can focus on salon growth',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('Direct team onboarding & training')).toBeInTheDocument();
      expect(screen.getByText('Encrypted & tenant-isolated salon data')).toBeInTheDocument();
      expect(screen.getByText('Instant setup with zero hardware lock')).toBeInTheDocument();
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
      expect(articles.length).toBe(4); // 1 transformation anchor + 3 strategic pillars

      articles.forEach((art) => {
        expect(art.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(art.className).not.toMatch(/\bborder\b/);
      });
    });
  });
});

