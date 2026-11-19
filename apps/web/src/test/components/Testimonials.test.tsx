/**
 * RASHX — Testimonials Component Unit Test Suite
 *
 * Verifies:
 * - Proper SectionTitle reuse with watermark
 * - Case 2 (No Fabricated Data): Renders authentic Experience Principles & Salon UX values
 * - Exact Arabic and English required titles ("تجربة إدارة أكثر وضوحًا." / "A clearer way to manage your salon.")
 * - RTL and LTR direction
 * - Strict adherence to zero-border and zero-shadow visual architecture
 * - Extensibility: architectural readiness to render verified testimonials when populated
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Testimonials, VERIFIED_TESTIMONIALS } from '@/components/home/Testimonials';

describe('RASHX — Testimonials & Experience Section Suite', () => {
  describe('Arabic (Default RTL) Mode', () => {
    it('renders exact Arabic section title and eyebrow via SectionTitle', () => {
      render(<Testimonials lang="ar" />);

      expect(screen.getByText('تجربة RASHX')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'تجربة إدارة أكثر وضوحًا.',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'صُممت الواجهة لتكون سهلة ومريحة لكل من في الصالون، من الاستقبال إلى الإدارة، لتتحول المهام اليومية المعقدة إلى خطوات بسيطة ومنظمة.'
        )
      ).toBeInTheDocument();
    });

    it('renders Arabic hero quote spotlight with micro-steps and highlight badge', () => {
      render(<Testimonials lang="ar" />);

      expect(screen.getByText('الهدوء البصري وسرعة الاستقبال')).toBeInTheDocument();
      expect(
        screen.getByText(
          /واجهة صالونك يجب ألا تكون مصدراً إضافياً للتوتر\. صممنا كل شاشة في RASHX/
        )
      ).toBeInTheDocument();

      expect(screen.getByText('استقبال وتسجيل الحجز في ثوانٍ معدودة')).toBeInTheDocument();
      expect(screen.getByText('إشعار فوري للأخصائية ببدء الجلسة')).toBeInTheDocument();
      expect(screen.getByText('إصدار الفاتورة وإغلاق الحساب بلمسة واحدة')).toBeInTheDocument();

      expect(
        screen.getByText('مبدأ RASHX: تبسيط التشغيل ليتفرغ الفريق لخدمة العميلات')
      ).toBeInTheDocument();
    });

    it('renders Arabic secondary editorial cards for staff and management', () => {
      render(<Testimonials lang="ar" />);

      // Staff Experience Card
      expect(screen.getByText('تجربة فريق العمل')).toBeInTheDocument();
      expect(
        screen.getByText(
          /لا تحتاج الأخصائية إلى تدريب طويل أو قراءة كتيبات معقدة؛ جدول المواعيد متاح على جوالها بوضوح/
        )
      ).toBeInTheDocument();
      expect(screen.getByText('واجهة واضحة لجميع أعضاء الفريق')).toBeInTheDocument();

      // Management Insight Card
      expect(screen.getByText('رؤية الإدارة والتحكم')).toBeInTheDocument();
      expect(
        screen.getByText(
          /راحة البال تبدأ عندما تتابع أداء الفروع وحركة المبيعات ونسب الإشغال في ثوانٍ/
        )
      ).toBeInTheDocument();
      expect(screen.getByText('متابعة لحظية بدون مجهود مكرر')).toBeInTheDocument();
    });

    it('renders Arabic bottom hands-on invitation banner with CTA link', () => {
      render(<Testimonials lang="ar" />);

      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'جرب تجربة RASHX بنفسك واكتشف الفرق التشغيلي',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'نؤمن بأن التجربة المباشرة هي أصدق مقياس لجودة المنظومة وسهولة استخدامها اليومي.'
        )
      ).toBeInTheDocument();

      const ctaLink = screen.getByRole('link', { name: /استكشف أدوات المنصة/ });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute('href', '/brand');
    });

    it('enforces RTL direction on the section root', () => {
      const { container } = render(<Testimonials lang="ar" />);
      const section = container.querySelector('#testimonials');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English (?lang=en LTR) Mode', () => {
    it('renders exact English section title and eyebrow via SectionTitle', () => {
      render(<Testimonials lang="en" />);

      expect(screen.getByText('THE RASHX EXPERIENCE')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'A clearer way to manage your salon.',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Thoughtfully designed to feel intuitive and calm for everyone in your salon, turning complex operational routines into effortless, clear workflows.'
        )
      ).toBeInTheDocument();
    });

    it('renders English hero quote spotlight, secondary cards, and CTA link', () => {
      render(<Testimonials lang="en" />);

      expect(screen.getByText('VISUAL CALM & FRONT DESK SPEED')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Your salon software should never be a source of daily stress\. We crafted every screen in RASHX/
        )
      ).toBeInTheDocument();

      expect(screen.getByText('Check in appointments in seconds')).toBeInTheDocument();
      expect(
        screen.getByText('Automated specialist notification on session start')
      ).toBeInTheDocument();
      expect(screen.getByText('One-tap checkout and receipt generation')).toBeInTheDocument();

      expect(screen.getByText('STAFF EXPERIENCE')).toBeInTheDocument();
      expect(screen.getByText('MANAGEMENT INSIGHT')).toBeInTheDocument();

      const ctaLink = screen.getByRole('link', { name: /Explore Platform Tools/ });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute('href', '/brand?lang=en');
    });

    it('enforces LTR direction on the section root', () => {
      const { container } = render(<Testimonials lang="en" />);
      const section = container.querySelector('#testimonials');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Strict Zero Borders and Zero Shadows Compliance', () => {
    it('ensures section and all internal cards do not use decorative shadows or borders', () => {
      const { container } = render(<Testimonials lang="ar" />);

      const section = container.querySelector('#testimonials');
      expect(section?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(section?.className).not.toMatch(/\bborder\b/);

      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(3); // 1 lead quote spotlight + 2 secondary cards

      articles.forEach((art) => {
        expect(art.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(art.className).not.toMatch(/\bborder\b/);
      });
    });
  });

  describe('Verified Testimonials Policy & Extensibility', () => {
    it('verifies that default VERIFIED_TESTIMONIALS is empty to respect truthfulness policy', () => {
      expect(VERIFIED_TESTIMONIALS.length).toBe(0);
    });
  });
});

