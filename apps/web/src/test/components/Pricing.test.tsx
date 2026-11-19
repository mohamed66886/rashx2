import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PricingHero,
  PricingPlans,
  PlanComparison,
  PricingFAQ,
  PricingCTA,
} from '@/components/pricing';

describe('RASHX Pricing Page Sections Suite', () => {
  describe('Section A: PricingHero', () => {
    it('renders exact Arabic heading, eyebrow, and description', () => {
      render(<PricingHero lang="ar" />);
      expect(screen.getByText('الاشتراك في RASHX')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: 'اختر ما يناسب نمو منشأتك.' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'اكتشف خيارات الاشتراك المتاحة لإدارة منشأتك من خلال منظومة رقمية متكاملة.'
        )
      ).toBeInTheDocument();
    });

    it('renders exact English heading, eyebrow, and description', () => {
      render(<PricingHero lang="en" />);
      expect(screen.getByText('RASHX SUBSCRIPTION')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: 'Choose the Right Plan for Your Business.' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Explore the available subscription options to manage your business through one integrated digital platform.'
        )
      ).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<PricingHero lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section B: PricingPlans', () => {
    it('renders the 3 verified subscription tiers without fabricated prices', () => {
      render(<PricingPlans lang="ar" />);
      expect(screen.getByText('باقة الانطلاق')).toBeInTheDocument();
      expect(screen.getByText('باقة الصالون المتكامل')).toBeInTheDocument();
      expect(screen.getByText('باقة السلاسل ومراكز السبا')).toBeInTheDocument();

      // Check transparent custom pricing instead of fabricated figures
      const customPriceLabels = screen.getAllByText('تسعير مخصص');
      expect(customPriceLabels.length).toBeGreaterThanOrEqual(2);

      // Check working email CTAs
      expect(screen.getByRole('link', { name: /تواصل لطلب الباقة/i })).toHaveAttribute(
        'href',
        expect.stringContaining('mailto:hello@rashx.com')
      );
    });

    it('renders English plan names in English mode', () => {
      render(<PricingPlans lang="en" />);
      expect(screen.getByText('Starter Plan')).toBeInTheDocument();
      expect(screen.getByText('Integrated Salon Pro')).toBeInTheDocument();
      expect(screen.getByText('Enterprise & Spa Chains')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<PricingPlans lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section C: PlanComparison', () => {
    it('renders plan comparison table with verified capabilities', () => {
      render(<PlanComparison lang="ar" />);
      expect(
        screen.getByRole('heading', { level: 2, name: /مقارنة دقيقة وشاملة بين باقات RASHX/i })
      ).toBeInTheDocument();

      expect(screen.getByText('تقويم مواعيد تفاعلي يمنع الحجز المزدوج')).toBeInTheDocument();
      expect(
        screen.getByText('فواتير ضريبية مبسطة مع رمز الاستجابة السريع (QR)')
      ).toBeInTheDocument();
      expect(screen.getByText('احتساب عمولات وحوافز الأخصائيات آليًا')).toBeInTheDocument();
      expect(screen.getByText('إدارة موحدة للفروع المتعددة من لوحة واحدة')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<PlanComparison lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section D: PricingFAQ', () => {
    it('renders verified factual subscription questions and answers', () => {
      render(<PricingFAQ lang="ar" />);
      expect(
        screen.getByRole('heading', { level: 2, name: /إجابات واضحة ومباشرة عن باقات RASHX/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText('كيف يتم تحديد تكلفة اشتراك راش إكس لمنشأتي؟')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'هل يتضمن الاشتراك التوافق مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA)؟'
        )
      ).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<PricingFAQ lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section E: PricingCTA', () => {
    it('renders exact Arabic heading and verified contact links', () => {
      render(<PricingCTA lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'هل تحتاج إلى مساعدة في اختيار الاشتراك المناسب؟',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /تواصل مع مستشار الاشتراكات/i })
      ).toHaveAttribute('href', expect.stringContaining('mailto:hello@rashx.com'));
      expect(
        screen.getByRole('link', { name: /استكشف مميزات المنظومة/i })
      ).toHaveAttribute('href', '/features');
    });

    it('renders exact English heading in English mode', () => {
      render(<PricingCTA lang="en" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Need help choosing the right subscription?',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Explore Platform Features/i })
      ).toHaveAttribute('href', '/features?lang=en');
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<PricingCTA lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });
});

