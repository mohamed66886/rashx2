import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HowItWorks } from '@/components/home';

describe('RASHX — How It Works Section Suite', () => {
  describe('Arabic Content & RTL Verification (Default)', () => {
    it('renders exact Arabic section title and eyebrow via SectionTitle', () => {
      render(<HowItWorks lang="ar" />);

      // Section Eyebrow & Title
      expect(screen.getByText('رحلة الاستخدام')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'ابدأ مع RASHX بخطوات بسيطة.',
        })
      ).toBeInTheDocument();

      // Subtitle
      expect(
        screen.getByText(
          'من إعداد بيانات صالونك وفريقك حتى استقبال أول حجز ومتابعة العمليات، صُممت المنصة لتنطلق بأعمالك بسلاسة ووضوح.'
        )
      ).toBeInTheDocument();
    });

    it('renders all four sequential onboarding steps with numbers, titles, and preview chips', () => {
      render(<HowItWorks lang="ar" />);

      // Step 01
      expect(screen.getAllByText('01')[0]).toBeInTheDocument();
      expect(screen.getAllByText('الخطوة الأولى')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'إنشاء حساب الصالون وبيانات المنشأة',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('صالون معتمد · +966')[0]).toBeInTheDocument();

      // Step 02
      expect(screen.getAllByText('02')[0]).toBeInTheDocument();
      expect(screen.getAllByText('الخطوة الثانية')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'إعداد الفروع وتحديد قائمة الخدمات',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('فروع متعددة · قائمة أسعار')[0]).toBeInTheDocument();

      // Step 03
      expect(screen.getAllByText('03')[0]).toBeInTheDocument();
      expect(screen.getAllByText('الخطوة الثالثة')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'تعيين فريق العمل وجدولة الورديات',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('توزيع الأخصائيات · ورديات حية')[0]).toBeInTheDocument();

      // Step 04
      expect(screen.getAllByText('04')[0]).toBeInTheDocument();
      expect(screen.getAllByText('الخطوة الرابعة')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'بدء استقبال الحجوزات وإدارة العمليات',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('تقويم حي · تأكيد واتساب فوري')[0]).toBeInTheDocument();
    });

    it('renders journey convergence support banner', () => {
      render(<HowItWorks lang="ar" />);

      expect(
        screen.getByText('منظومة جاهزة للعمل فور اكتمال الإعداد')
      ).toBeInTheDocument();
      expect(
        screen.getByText('دعم فني وتدريب مباشر لفريق صالونك من اليوم الأول')
      ).toBeInTheDocument();
    });

    it('enforces RTL direction on the section root', () => {
      const { container } = render(<HowItWorks lang="ar" />);
      const section = container.querySelector('#how-it-works');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English Content & LTR Verification (?lang=en)', () => {
    it('renders exact English section title and eyebrow via SectionTitle', () => {
      render(<HowItWorks lang="en" />);

      expect(screen.getByText('HOW IT WORKS')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Getting started with RASHX is simple.',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'From setting up your salon profile and staff to managing appointments and daily checkout, every step is designed for clarity and speed.'
        )
      ).toBeInTheDocument();
    });

    it('renders English sequential onboarding steps and preview chips', () => {
      render(<HowItWorks lang="en" />);

      // Step 01
      expect(screen.getAllByText('01')[0]).toBeInTheDocument();
      expect(screen.getAllByText('STEP ONE')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Create Salon Account & Business Profile',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('Verified Salon · +966')[0]).toBeInTheDocument();

      // Step 02
      expect(screen.getAllByText('02')[0]).toBeInTheDocument();
      expect(screen.getAllByText('STEP TWO')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Configure Branches & Service Menu',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('Multi-branch · Service menu')[0]).toBeInTheDocument();

      // Step 03
      expect(screen.getAllByText('03')[0]).toBeInTheDocument();
      expect(screen.getAllByText('STEP THREE')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Add Staff Specialists & Working Shifts',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('Specialist routing · Shifts')[0]).toBeInTheDocument();

      // Step 04
      expect(screen.getAllByText('04')[0]).toBeInTheDocument();
      expect(screen.getAllByText('STEP FOUR')[0]).toBeInTheDocument();
      expect(
        screen.getAllByRole('heading', {
          level: 3,
          name: 'Launch Live Bookings & Operations',
        })[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText('Live calendar · Auto WhatsApp')[0]).toBeInTheDocument();
    });

    it('enforces LTR direction on the section root', () => {
      const { container } = render(<HowItWorks lang="en" />);
      const section = container.querySelector('#how-it-works');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Strict Zero Borders and Zero Shadows Compliance', () => {
    it('ensures section and all four article step cards do not use decorative shadows or borders', () => {
      const { container } = render(<HowItWorks lang="ar" />);

      const section = container.querySelector('#how-it-works');
      expect(section?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(section?.className).not.toMatch(/\bborder\b/);

      const stepArticles = container.querySelectorAll('article');
      expect(stepArticles.length).toBeGreaterThanOrEqual(4);

      stepArticles.forEach((art) => {
        expect(art.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(art.className).not.toMatch(/\bborder\b/);
      });
    });
  });
});

