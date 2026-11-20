import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlatformFeatures } from '@/components/home';

describe('RASHX — Platform Features Section Suite', () => {
  describe('Arabic Content & RTL Verification (Default)', () => {
    it('renders exact Arabic section title via SectionTitle', () => {
      render(<PlatformFeatures lang="ar" />);

      // Section Title
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'كل ما تحتاجه لإدارة صالونك باحترافية وتكامل.',
        })
      ).toBeInTheDocument();
    });

    it('renders the Anchor Capability (Smart Scheduling Calendar) with live timeline preview', () => {
      render(<PlatformFeatures lang="ar" />);

      // Anchor badge & heading
      expect(screen.getAllByText('المحرك الأساسي')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'جدول مواعيد ذكي وفوري يربط الحجوزات بالفريق',
        })[0]
      ).toBeInTheDocument();

      // Anchor capability tags
      expect(screen.getAllByText('منع تعارض المواعيد')[0]).toBeInTheDocument();
      expect(screen.getAllByText('توزيع فوري على الموظفات')[0]).toBeInTheDocument();
      expect(screen.getAllByText('تتبع حالة الزيارة')[0]).toBeInTheDocument();

      // Anchor live timeline preview slots (mobile list & desktop swimlane)
      expect(screen.getAllByText('اليوم · جدول المواعيد الحي')[0]).toBeInTheDocument();
      expect(screen.getAllByText('قص وتصفيف شعر')[0]).toBeInTheDocument();
      expect(screen.getAllByText('سارة')[0]).toBeInTheDocument();
      expect(screen.getAllByText('مكتمل')[0]).toBeInTheDocument();
      expect(screen.getAllByText('جلسة عناية بالبشرة')[0]).toBeInTheDocument();
      expect(screen.getAllByText('نورة')[0]).toBeInTheDocument();
      expect(screen.getAllByText('جاري الآن')[0]).toBeInTheDocument();
      expect(screen.getAllByText('مساج وسبا متكامل')[0]).toBeInTheDocument();
      expect(screen.getAllByText('ريم')[0]).toBeInTheDocument();
      expect(screen.getAllByText('قادم')[0]).toBeInTheDocument();
    });

    it('renders all four supporting capabilities with domain categories and tags', () => {
      render(<PlatformFeatures lang="ar" />);

      // 1. POS & Payments
      expect(screen.getAllByText('المدفوعات والمبيعات')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'نقطة بيع سريعة وفوترة معتمدة',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('دفع متعدد')[0]).toBeInTheDocument();

      // 2. Client Profiles
      expect(screen.getAllByText('علاقات العميلات')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'ملف شامل لكل عميلة وسجل الزيارات',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('سجل الزيارات')[0]).toBeInTheDocument();

      // 3. Staff & Commissions
      expect(screen.getAllByText('فريق العمل والإنتاجية')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'تنظيم الورديات واحتساب العمولات تلقائياً',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('جدولة الورديات')[0]).toBeInTheDocument();

      // 4. Inventory
      expect(screen.getAllByText('المخزون والمشتريات')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'متابعة دقيقة للمخزون ومستهلكات الجلسات',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('جرد فوري')[0]).toBeInTheDocument();
    });

    it('renders Executive Insights & Metrics hub with proven operational numbers', () => {
      render(<PlatformFeatures lang="ar" />);

      expect(screen.getAllByText('التقارير والرؤى')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'رؤية تشغيلية وتحليلات فورية لأداء صالونك',
        })[0]
      ).toBeInTheDocument();

      // Metric indicators
      expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
      expect(screen.getAllByText('ترابط كامل بين المواعيد ونقاط البيع')[0]).toBeInTheDocument();
      expect(screen.getAllByText('0')[0]).toBeInTheDocument();
      expect(screen.getAllByText('أخطاء في احتساب العمولات اليدوية')[0]).toBeInTheDocument();
      expect(screen.getAllByText('24/7')[0]).toBeInTheDocument();
      expect(screen.getAllByText('متابعة حية من أي شاشة وجهاز')[0]).toBeInTheDocument();
    });

    it('enforces RTL direction on the section root', () => {
      const { container } = render(<PlatformFeatures lang="ar" />);
      const section = container.querySelector('#platform-features');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English Content & LTR Verification (?lang=en)', () => {
    it('renders exact English section title via SectionTitle', () => {
      render(<PlatformFeatures lang="en" />);

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Everything you need to run your salon with precision and ease.',
        })
      ).toBeInTheDocument();
    });

    it('renders English Anchor Capability and timeline slots', () => {
      render(<PlatformFeatures lang="en" />);

      expect(screen.getAllByText('CORE SCHEDULING ENGINE')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Intelligent Real-Time Calendar Connecting Bookings to Staff',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('Conflict prevention')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Instant staff routing')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Live status tracking')[0]).toBeInTheDocument();

      expect(screen.getAllByText("Today · Live Salon Schedule")[0]).toBeInTheDocument();
      expect(screen.getAllByText('Hair Styling & Cut')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Completed')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Facial Skincare Treatment')[0]).toBeInTheDocument();
      expect(screen.getAllByText('In Progress')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Full Body Spa & Massage')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Upcoming')[0]).toBeInTheDocument();
    });

    it('renders English supporting capabilities and metrics hub', () => {
      render(<PlatformFeatures lang="en" />);

      expect(screen.getAllByText('POS & PAYMENTS')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Rapid POS & Compliant Invoicing',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('CLIENT RELATIONSHIPS')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Complete Client Profiles & History',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('STAFF & PERFORMANCE')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Shift Rosters & Automated Commissions',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('INVENTORY CONTROL')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Stock Control & Treatment Supplies',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('EXECUTIVE INSIGHTS')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Real-Time Operational Visibility & Growth Insights',
        })[0]
      ).toBeInTheDocument();

      expect(screen.getAllByText('Appointment-to-POS integration')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Manual commission calculation errors')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Live monitoring across all devices')[0]).toBeInTheDocument();
    });

    it('enforces LTR direction on the section root', () => {
      const { container } = render(<PlatformFeatures lang="en" />);
      const section = container.querySelector('#platform-features');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Strict Zero Borders and Zero Shadows Compliance', () => {
    it('ensures section and all internal article cards do not use decorative shadows or borders', () => {
      const { container } = render(<PlatformFeatures lang="ar" />);

      const section = container.querySelector('#platform-features');
      expect(section?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(section?.className).not.toMatch(/\bborder\b/);

      // Check all article elements (Anchor, 4 Supporting cards, Metrics card across responsive variants)
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);

      articles.forEach((art) => {
        expect(art.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(art.className).not.toMatch(/\bborder\b/);
      });
    });
  });
});

