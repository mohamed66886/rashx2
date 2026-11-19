import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlatformFeatures } from '@/components/home';

describe('RASHX — Platform Features Section Suite', () => {
  describe('Arabic Content & RTL Verification (Default)', () => {
    it('renders exact Arabic section title and eyebrow via SectionTitle', () => {
      render(<PlatformFeatures lang="ar" />);

      // Section Eyebrow & Title
      expect(screen.getByText('إمكانيات المنظومة')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'كل ما تحتاجه لإدارة صالونك باحترافية وتكامل.',
        })
      ).toBeInTheDocument();

      // Section Subtitle
      expect(
        screen.getByText(
          'أدوات مترابطة تعمل معًا بسلاسة لتبسيط العمليات اليومية وتوفير تجربة استثنائية لعميلاتك وفريق عملك.'
        )
      ).toBeInTheDocument();
    });

    it('renders the Anchor Capability (Smart Scheduling Calendar) with live timeline preview', () => {
      render(<PlatformFeatures lang="ar" />);

      // Anchor badge & heading
      expect(screen.getByText('المحرك الأساسي')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'جدول مواعيد ذكي وفوري يربط الحجوزات بالفريق',
        })
      ).toBeInTheDocument();

      // Anchor capability tags
      expect(screen.getByText('منع تعارض المواعيد')).toBeInTheDocument();
      expect(screen.getByText('توزيع فوري على الموظفات')).toBeInTheDocument();
      expect(screen.getByText('تتبع حالة الزيارة')).toBeInTheDocument();

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
      expect(screen.getByText('المدفوعات والمبيعات')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'نقطة بيع سريعة وفوترة معتمدة',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('دفع متعدد')).toBeInTheDocument();

      // 2. Client Profiles
      expect(screen.getByText('علاقات العميلات')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'ملف شامل لكل عميلة وسجل الزيارات',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('سجل الزيارات')).toBeInTheDocument();

      // 3. Staff & Commissions
      expect(screen.getByText('فريق العمل والإنتاجية')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'تنظيم الورديات واحتساب العمولات تلقائياً',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('جدولة الورديات')).toBeInTheDocument();

      // 4. Inventory
      expect(screen.getByText('المخزون والمشتريات')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'متابعة دقيقة للمخزون ومستهلكات الجلسات',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('جرد فوري')).toBeInTheDocument();
    });

    it('renders Executive Insights & Metrics hub with proven operational numbers', () => {
      render(<PlatformFeatures lang="ar" />);

      expect(screen.getByText('التقارير والرؤى')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'رؤية تشغيلية وتحليلات فورية لأداء صالونك',
        })
      ).toBeInTheDocument();

      // Metric indicators
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('ترابط كامل بين المواعيد ونقاط البيع')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('أخطاء في احتساب العمولات اليدوية')).toBeInTheDocument();
      expect(screen.getByText('24/7')).toBeInTheDocument();
      expect(screen.getByText('متابعة حية من أي شاشة وجهاز')).toBeInTheDocument();
    });

    it('enforces RTL direction on the section root', () => {
      const { container } = render(<PlatformFeatures lang="ar" />);
      const section = container.querySelector('#platform-features');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English Content & LTR Verification (?lang=en)', () => {
    it('renders exact English section title and eyebrow via SectionTitle', () => {
      render(<PlatformFeatures lang="en" />);

      expect(screen.getByText('PLATFORM CAPABILITIES')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Everything you need to run your salon with precision and ease.',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Connected tools working in unison to streamline daily operations and elevate the experience for your clients and team.'
        )
      ).toBeInTheDocument();
    });

    it('renders English Anchor Capability and timeline slots', () => {
      render(<PlatformFeatures lang="en" />);

      expect(screen.getByText('CORE SCHEDULING ENGINE')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Intelligent Real-Time Calendar Connecting Bookings to Staff',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('Conflict prevention')).toBeInTheDocument();
      expect(screen.getByText('Instant staff routing')).toBeInTheDocument();
      expect(screen.getByText('Live status tracking')).toBeInTheDocument();

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

      expect(screen.getByText('POS & PAYMENTS')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Rapid POS & Compliant Invoicing',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('CLIENT RELATIONSHIPS')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Complete Client Profiles & History',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('STAFF & PERFORMANCE')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Shift Rosters & Automated Commissions',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('INVENTORY CONTROL')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Stock Control & Treatment Supplies',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('EXECUTIVE INSIGHTS')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Real-Time Operational Visibility & Growth Insights',
        })
      ).toBeInTheDocument();

      expect(screen.getByText('Appointment-to-POS integration')).toBeInTheDocument();
      expect(screen.getByText('Manual commission calculation errors')).toBeInTheDocument();
      expect(screen.getByText('Live monitoring across all devices')).toBeInTheDocument();
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

      // Check all article elements (Anchor, 4 Supporting cards, Metrics card)
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(6);

      articles.forEach((art) => {
        expect(art.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(art.className).not.toMatch(/\bborder\b/);
      });
    });
  });
});

