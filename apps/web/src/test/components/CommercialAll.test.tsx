import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  DemoHero,
  DemoHighlights,
  DemoForm,
  DemoCTA,
} from '@/components/demo';
import {
  GetStartedHero,
  GetStartedSteps,
  GetStartedGuarantees,
  GetStartedForm,
  GetStartedCTA,
} from '@/components/get-started';
import { demoData, getStartedData } from '@/data/commercial';

describe('RASHX Commercial Suite (/demo & /get-started)', () => {
  describe('Demo Components (/demo)', () => {
    it('renders DemoHero with correct titles and zero borders/shadows', () => {
      const { container } = render(<DemoHero lang="ar" />);
      expect(screen.getByText(demoData.hero.title.ar)).toBeInTheDocument();
      expect(screen.getByText(demoData.hero.eyebrow.ar)).toBeInTheDocument();

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

    it('renders DemoHighlights with all 4 pillars and zero borders/shadows', () => {
      const { container } = render(<DemoHighlights lang="ar" />);
      demoData.highlights.forEach((h) => {
        expect(screen.getByText(h.title.ar)).toBeInTheDocument();
      });

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

    it('validates required fields in DemoForm', () => {
      render(<DemoForm lang="ar" />);
      const submitButton = screen.getByRole('button', { name: /طلب حجز العرض الحي/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/يرجى كتابة الاسم الكامل للمتابعة والتنسيق/i)).toBeInTheDocument();
      expect(screen.getByText(/يرجى كتابة اسم المنشأة أو الصالون/i)).toBeInTheDocument();
    });

    it('handles unsupported submission without fake success, showing verified contact', async () => {
      render(<DemoForm lang="ar" />);

      fireEvent.change(screen.getByLabelText(/الاسم الكامل/i), {
        target: { value: 'سارة العتيبي' },
      });
      fireEvent.change(screen.getByLabelText(/اسم الصالون أو المركز/i), {
        target: { value: 'صالون لمسة الأناقة' },
      });
      fireEvent.change(screen.getByLabelText(/رقم الجوال للتنسيق/i), {
        target: { value: '0548082945' },
      });
      fireEvent.change(screen.getByLabelText(/البريد الإلكتروني للعمل/i), {
        target: { value: 'sara@salon.com' },
      });

      const submitButton = screen.getByRole('button', { name: /طلب حجز العرض الحي/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Direct Demo Scheduling')).toBeInTheDocument();
        expect(screen.getByText('+966 54 808 2945')).toBeInTheDocument();
      });
    });

    it('submits successfully when custom onSubmit is passed', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      render(<DemoForm lang="ar" onSubmit={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/الاسم الكامل/i), {
        target: { value: 'سارة العتيبي' },
      });
      fireEvent.change(screen.getByLabelText(/اسم الصالون أو المركز/i), {
        target: { value: 'صالون لمسة الأناقة' },
      });
      fireEvent.change(screen.getByLabelText(/رقم الجوال للتنسيق/i), {
        target: { value: '0548082945' },
      });
      fireEvent.change(screen.getByLabelText(/البريد الإلكتروني للعمل/i), {
        target: { value: 'sara@salon.com' },
      });

      const submitButton = screen.getByRole('button', { name: /طلب حجز العرض الحي/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('renders DemoCTA with zero borders/shadows', () => {
      const { container } = render(<DemoCTA lang="ar" />);
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

  describe('Get Started Components (/get-started)', () => {
    it('renders GetStartedHero with correct titles and zero borders/shadows', () => {
      const { container } = render(<GetStartedHero lang="ar" />);
      expect(screen.getByText(getStartedData.hero.title.ar)).toBeInTheDocument();
      expect(screen.getByText(getStartedData.hero.eyebrow.ar)).toBeInTheDocument();

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

    it('renders GetStartedSteps with all 4 steps and zero borders/shadows', () => {
      const { container } = render(<GetStartedSteps lang="ar" />);
      getStartedData.onboardingSteps.forEach((s) => {
        expect(screen.getByText(s.title.ar)).toBeInTheDocument();
      });

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

    it('renders GetStartedGuarantees with all 3 assurances and zero borders/shadows', () => {
      const { container } = render(<GetStartedGuarantees lang="ar" />);
      getStartedData.guarantees.forEach((g) => {
        expect(screen.getByText(g.title.ar)).toBeInTheDocument();
      });

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

    it('validates required fields in GetStartedForm', () => {
      render(<GetStartedForm lang="ar" />);
      const submitButton = screen.getByRole('button', { name: /تأكيد حجز المساحة وبدء التهيئة/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/يرجى إدخال اسم المسؤول أو المالك/i)).toBeInTheDocument();
      expect(screen.getByText(/يرجى إدخال اسم الصالون أو المركز/i)).toBeInTheDocument();
      expect(screen.getByText(/يرجى تحديد النطاق الفرعي المطلوب/i)).toBeInTheDocument();
    });

    it('handles unsupported onboarding submission, showing verified direct line', async () => {
      render(<GetStartedForm lang="ar" />);

      fireEvent.change(screen.getByLabelText(/اسم المسؤول \/ المالك/i), {
        target: { value: 'نورة السالم' },
      });
      fireEvent.change(screen.getByLabelText(/اسم الصالون أو المركز/i), {
        target: { value: 'صالون رقة وجمال' },
      });
      fireEvent.change(screen.getByLabelText(/النطاق الفرعي المطلوب/i), {
        target: { value: 'reqa-beauty' },
      });
      fireEvent.change(screen.getByLabelText(/رقم الجوال للتواصل والربط/i), {
        target: { value: '0548082945' },
      });
      fireEvent.change(screen.getByLabelText(/البريد الإلكتروني المعتمد للإدارة/i), {
        target: { value: 'noura@reqa.com' },
      });

      const submitButton = screen.getByRole('button', { name: /تأكيد حجز المساحة وبدء التهيئة/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Direct Onboarding Activation')).toBeInTheDocument();
        expect(screen.getByText('+966 54 808 2945')).toBeInTheDocument();
      });
    });

    it('renders GetStartedCTA with zero borders/shadows', () => {
      const { container } = render(<GetStartedCTA lang="ar" />);
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

