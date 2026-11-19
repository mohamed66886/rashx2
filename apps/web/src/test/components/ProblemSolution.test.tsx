import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProblemSolution } from '@/components/home';

describe('RASHX — Problem & Solution Section Suite', () => {
  describe('Arabic Content & RTL Verification (Default)', () => {
    it('renders exact Arabic section title and supporting intro text', () => {
      render(<ProblemSolution lang="ar" />);

      // Section title rendered via SectionTitle
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'إدارة صالونك ما المفروض تكون معقدة.',
        })
      ).toBeInTheDocument();

      // Supporting introductory text
      expect(
        screen.getByText(
          'لما كل جزء من شغلك يُدار بطريقة مختلفة، بتفقد الصورة الكاملة.'
        )
      ).toBeInTheDocument();
    });

    it('renders all four operational challenges in Arabic', () => {
      render(<ProblemSolution lang="ar" />);

      // 1. المواعيد
      expect(
        screen.getByRole('heading', { level: 3, name: 'المواعيد' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('حجوزات متفرقة وصعوبة المتابعة.')
      ).toBeInTheDocument();

      // 2. العملاء
      expect(
        screen.getByRole('heading', { level: 3, name: 'العملاء' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('بيانات موزعة وتجربة غير متسقة.')
      ).toBeInTheDocument();

      // 3. الفريق
      expect(
        screen.getByRole('heading', { level: 3, name: 'الفريق' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('متابعة الموظفين والمهام يدويًا.')
      ).toBeInTheDocument();

      // 4. المبيعات
      expect(
        screen.getByRole('heading', { level: 3, name: 'المبيعات' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('صعوبة متابعة الأداء والإيرادات.')
      ).toBeInTheDocument();
    });

    it('renders exact solution statement and supporting text in Arabic', () => {
      render(<ProblemSolution lang="ar" />);

      // Solution statement
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'كل أعمالك في منظومة واحدة.',
        })
      ).toBeInTheDocument();

      // Solution supporting text
      expect(
        screen.getByText(
          'إدارة مترابطة تمنحك رؤية أوضح وتحكمًا أكبر في تفاصيل صالونك.'
        )
      ).toBeInTheDocument();
    });

    it('enforces RTL direction on the section root', () => {
      const { container } = render(<ProblemSolution lang="ar" />);
      const section = container.querySelector('#problem-solution');
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English Content & LTR Verification (?lang=en)', () => {
    it('renders exact English section title and supporting intro text', () => {
      render(<ProblemSolution lang="en" />);

      // Section title rendered via SectionTitle
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: "Managing your salon shouldn't be complicated.",
        })
      ).toBeInTheDocument();

      // Supporting introductory text
      expect(
        screen.getByText(
          "When every part of your business is managed separately, it's difficult to see the full picture."
        )
      ).toBeInTheDocument();
    });

    it('renders all four operational challenges in English', () => {
      render(<ProblemSolution lang="en" />);

      // 1. Appointments
      expect(
        screen.getByRole('heading', { level: 3, name: 'Appointments' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Scattered bookings and difficult follow-ups.')
      ).toBeInTheDocument();

      // 2. Customers
      expect(
        screen.getByRole('heading', { level: 3, name: 'Customers' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Disconnected information and inconsistent experiences.')
      ).toBeInTheDocument();

      // 3. Team
      expect(
        screen.getByRole('heading', { level: 3, name: 'Team' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Manual employee and task coordination.')
      ).toBeInTheDocument();

      // 4. Sales
      expect(
        screen.getByRole('heading', { level: 3, name: 'Sales' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Limited visibility into performance and revenue.')
      ).toBeInTheDocument();
    });

    it('renders exact solution statement and supporting text in English', () => {
      render(<ProblemSolution lang="en" />);

      // Solution statement
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Your entire business, connected in one system.',
        })
      ).toBeInTheDocument();

      // Solution supporting text
      expect(
        screen.getByText(
          'An integrated management experience that gives you a clearer view and greater control over your salon.'
        )
      ).toBeInTheDocument();
    });

    it('enforces LTR direction on the section root', () => {
      const { container } = render(<ProblemSolution lang="en" />);
      const section = container.querySelector('#problem-solution');
      expect(section).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Strict Zero Borders and Zero Shadows Compliance', () => {
    it('ensures section, cards, and solution banner do not use decorative shadows or borders', () => {
      const { container } = render(<ProblemSolution lang="ar" />);

      const section = container.querySelector('#problem-solution');
      expect(section?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(section?.className).not.toMatch(/\bborder\b/);

      // Challenge cards
      const challengeCards = container.querySelectorAll('.bg-\\[\\#FAF9F8\\]');
      expect(challengeCards.length).toBe(4);
      challengeCards.forEach((card) => {
        expect(card.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(card.className).not.toMatch(/\bborder\b/);
      });

      // Solution banner (Peach background)
      const solutionBanner = container.querySelector('.bg-\\[\\#F0C5AE\\]');
      expect(solutionBanner).toBeInTheDocument();
      expect(solutionBanner?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(solutionBanner?.className).not.toMatch(/\bborder\b/);
    });
  });
});

