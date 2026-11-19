import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterInterestForm } from '@/app/register-interest/RegisterInterestForm';
import { ConsultationForm } from '@/app/consultation/ConsultationForm';

describe('RASHX Public Pages & Conversion Forms Suite', () => {
  describe('Register Interest Form (/register-interest)', () => {
    it('validates required fields', () => {
      render(<RegisterInterestForm lang="ar" />);
      const submitBtn = screen.getByRole('button', { name: /تسجيل الاهتمام والحصول على الأولوية/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/يرجى كتابة الاسم الكامل/i)).toBeInTheDocument();
      expect(screen.getByText(/يرجى كتابة اسم المنشأة أو المشروع/i)).toBeInTheDocument();
    });

    it('handles unsupported registration gracefully showing official phone', async () => {
      render(<RegisterInterestForm lang="ar" />);

      fireEvent.change(screen.getByLabelText(/الاسم الكامل/i), {
        target: { value: 'عبدالله السالم' },
      });
      fireEvent.change(screen.getByLabelText(/اسم المنشأة أو المشروع/i), {
        target: { value: 'مشروع صالون جديد' },
      });
      fireEvent.change(screen.getByLabelText(/رقم الجوال للتواصل/i), {
        target: { value: '0548082945' },
      });
      fireEvent.change(screen.getByLabelText(/البريد الإلكتروني للعمل/i), {
        target: { value: 'salem@salon.com' },
      });

      const submitBtn = screen.getByRole('button', { name: /تسجيل الاهتمام والحصول على الأولوية/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByLabelText('Direct Registration Coordination')).toBeInTheDocument();
        expect(screen.getByText('+966 54 808 2945')).toBeInTheDocument();
      });
    });

    it('submits successfully when custom onSubmit is passed', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      render(<RegisterInterestForm lang="ar" onSubmit={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/الاسم الكامل/i), {
        target: { value: 'عبدالله السالم' },
      });
      fireEvent.change(screen.getByLabelText(/اسم المنشأة أو المشروع/i), {
        target: { value: 'مشروع صالون جديد' },
      });
      fireEvent.change(screen.getByLabelText(/رقم الجوال للتواصل/i), {
        target: { value: '0548082945' },
      });
      fireEvent.change(screen.getByLabelText(/البريد الإلكتروني للعمل/i), {
        target: { value: 'salem@salon.com' },
      });

      const submitBtn = screen.getByRole('button', { name: /تسجيل الاهتمام والحصول على الأولوية/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('contains zero borders and zero shadows', () => {
      const { container } = render(<RegisterInterestForm lang="ar" />);
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

  describe('Consultation Form (/consultation)', () => {
    it('validates required fields', () => {
      render(<ConsultationForm lang="ar" />);
      const submitBtn = screen.getByRole('button', { name: /طلب حجز الجلسة الاستشارية المجانية/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/يرجى كتابة اسم المسؤول/i)).toBeInTheDocument();
      expect(screen.getByText(/يرجى كتابة اسم الصالون أو المركز/i)).toBeInTheDocument();
    });

    it('handles unsupported consultation gracefully showing official phone', async () => {
      render(<ConsultationForm lang="ar" />);

      fireEvent.change(screen.getByLabelText(/اسم المسؤول \/ المالك/i), {
        target: { value: 'مشاعل السبيعي' },
      });
      fireEvent.change(screen.getByLabelText(/اسم الصالون أو المركز/i), {
        target: { value: 'صالون الأناقة' },
      });
      fireEvent.change(screen.getByLabelText(/رقم الجوال للتواصل/i), {
        target: { value: '0548082945' },
      });
      fireEvent.change(screen.getByLabelText(/البريد الإلكتروني للعمل/i), {
        target: { value: 'mashael@salon.com' },
      });

      const submitBtn = screen.getByRole('button', { name: /طلب حجز الجلسة الاستشارية المجانية/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByLabelText('Direct Consultation Coordination')).toBeInTheDocument();
        expect(screen.getByText('+966 54 808 2945')).toBeInTheDocument();
      });
    });

    it('submits successfully when custom onSubmit is passed', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      render(<ConsultationForm lang="ar" onSubmit={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/اسم المسؤول \/ المالك/i), {
        target: { value: 'مشاعل السبيعي' },
      });
      fireEvent.change(screen.getByLabelText(/اسم الصالون أو المركز/i), {
        target: { value: 'صالون الأناقة' },
      });
      fireEvent.change(screen.getByLabelText(/رقم الجوال للتواصل/i), {
        target: { value: '0548082945' },
      });
      fireEvent.change(screen.getByLabelText(/البريد الإلكتروني للعمل/i), {
        target: { value: 'mashael@salon.com' },
      });

      const submitBtn = screen.getByRole('button', { name: /طلب حجز الجلسة الاستشارية المجانية/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('contains zero borders and zero shadows', () => {
      const { container } = render(<ConsultationForm lang="ar" />);
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

