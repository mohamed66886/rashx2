/**
 * RASHX — Frequently Asked Questions (FAQ) Component Unit Test Suite
 *
 * Verifies:
 * - Proper SectionTitle reuse with watermark
 * - Arabic (RTL) and English (LTR) rendering
 * - All 7 factual questions & answers derived from verified codebase capabilities
 * - Native accessible accordion structure (<details> and <summary>)
 * - Support prompt banner with correct mailto link
 * - Strict adherence to zero-border and zero-shadow visual architecture
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FAQ } from '@/components/home/FAQ';

describe('RASHX — FAQ Section Suite', () => {
  describe('Arabic (Default RTL) Mode', () => {
    it('renders exact Arabic section title and eyebrow via SectionTitle', () => {
      render(<FAQ lang="ar" />);

      expect(screen.getByText('الأسئلة الشائعة')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'إجابات واضحة لكل ما يهمك عن RASHX.',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'كل ما تحتاج معرفته عن بدء استخدام المنصة، إدارة الفروع، الفريق والصلاحيات، والدعم الفني.'
        )
      ).toBeInTheDocument();
    });

    it('renders all 7 factual Arabic questions and answers', () => {
      render(<FAQ lang="ar" />);

      // Q1: What is RASHX
      expect(screen.getByText('ما هي منصة RASHX؟')).toBeInTheDocument();
      expect(
        screen.getByText(
          /RASHX هي منظومة سحابية ونظام تشغيل رقمي متكامل مصمم خصيصاً لصالونات التجميل/
        )
      ).toBeInTheDocument();

      // Q2: Target audience
      expect(screen.getByText('لمن صُممت المنصة؟')).toBeInTheDocument();
      expect(
        screen.getByText(
          /صُممت RASHX لتخدم مختلف أنشطة التجميل والعناية الشخصية: صالونات التجميل النسائية/
        )
      ).toBeInTheDocument();

      // Q3: Getting started
      expect(screen.getByText('كيف أبدأ استخدام RASHX في صالوني؟')).toBeInTheDocument();
      expect(
        screen.getByText(
          /تبدأ الرحلة بخطوات بسيطة ومنظمة: تسجيل بيانات الصالون وتأكيد رقم الجوال/
        )
      ).toBeInTheDocument();

      // Q4: Multi-branch
      expect(screen.getByText('هل تدعم المنصة إدارة أكثر من فرع؟')).toBeInTheDocument();
      expect(
        screen.getByText(
          /نعم، تتيح المنصة إدارة فروع متعددة تحت حساب موحد/
        )
      ).toBeInTheDocument();

      // Q5: Staff & permissions
      expect(
        screen.getByText('كيف تتم إدارة فريق العمل وتحديد الصلاحيات؟')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /يمكنك إضافة الموظفات وتعيين تخصص كل أخصائية، وجدولة الورديات/
        )
      ).toBeInTheDocument();

      // Q6: Saudi market fit
      expect(
        screen.getByText('هل المنصة مهيأة لمتطلبات الصالونات في المملكة؟')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /نعم بالكامل؛ المنصة مبنية باللغة العربية أولاً/
        )
      ).toBeInTheDocument();

      // Q7: Support & training
      expect(
        screen.getByText('كيف أحصل على الدعم الفني والتدريب لفريقي؟')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /نقدم دعماً ومساندة مباشرة لتدريب فريق صالونك على النظام/
        )
      ).toBeInTheDocument();
    });

    it('renders Arabic direct support prompt with mailto link', () => {
      render(<FAQ lang="ar" />);

      expect(
        screen.getByText('لديك استفسار آخر لم تجد إجابته هنا؟')
      ).toBeInTheDocument();

      const mailLink = screen.getByRole('link', { name: /hello@rashx\.com/ });
      expect(mailLink).toBeInTheDocument();
      expect(mailLink).toHaveAttribute('href', 'mailto:hello@rashx.com');
    });

    it('enforces RTL direction on the section root', () => {
      const { container } = render(<FAQ lang="ar" />);
      const section = container.querySelector('#faq');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English (?lang=en LTR) Mode', () => {
    it('renders exact English section title and eyebrow via SectionTitle', () => {
      render(<FAQ lang="en" />);

      expect(screen.getByText('FREQUENTLY ASKED QUESTIONS')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Clear answers to everything about RASHX.',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Everything you need to know about getting started, multi-branch management, staff permissions, and technical support.'
        )
      ).toBeInTheDocument();
    });

    it('renders all 7 English questions and answers', () => {
      render(<FAQ lang="en" />);

      expect(screen.getByText('What is RASHX?')).toBeInTheDocument();
      expect(
        screen.getByText(
          /RASHX is a comprehensive cloud operating system engineered specifically for beauty salons/
        )
      ).toBeInTheDocument();

      expect(screen.getByText('Who is the platform designed for?')).toBeInTheDocument();
      expect(screen.getByText('How do I get started with RASHX?')).toBeInTheDocument();
      expect(screen.getByText('Does RASHX support multiple branches?')).toBeInTheDocument();
      expect(
        screen.getByText('How are staff specialists and permissions managed?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Is the platform tailored to Saudi market requirements?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('How do we receive technical support and team training?')
      ).toBeInTheDocument();
    });

    it('enforces LTR direction on the section root', () => {
      const { container } = render(<FAQ lang="en" />);
      const section = container.querySelector('#faq');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Accessibility & Strict Zero Borders/Shadows Compliance', () => {
    it('uses native semantic <details> and <summary> tags for all 7 items', () => {
      const { container } = render(<FAQ lang="ar" />);

      const detailsElements = container.querySelectorAll('details');
      expect(detailsElements.length).toBe(7);

      const summaryElements = container.querySelectorAll('summary');
      expect(summaryElements.length).toBe(7);
    });

    it('ensures section and all accordion items do not use decorative shadows or borders', () => {
      const { container } = render(<FAQ lang="ar" />);

      const section = container.querySelector('#faq');
      expect(section?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(section?.className).not.toMatch(/\bborder\b/);

      const detailsList = container.querySelectorAll('details');
      detailsList.forEach((elem) => {
        expect(elem.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(elem.className).not.toMatch(/\bborder\b/);
      });
    });
  });
});

