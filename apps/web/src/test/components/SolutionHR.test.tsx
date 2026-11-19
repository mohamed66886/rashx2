import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SolutionHero,
  SolutionCapabilities,
  SolutionImpact,
  SolutionEcosystem,
  SolutionCTA,
} from '@/components/solutions';
import { solutionsData } from '@/data/solutions';

const hrSolution = solutionsData.hr!;

describe('RASHX HR Management Solution Suite (/solutions/hr)', () => {
  describe('Section A: SolutionHero', () => {
    it('renders exact Arabic heading, badge, and value highlights', () => {
      render(<SolutionHero solution={hrSolution} lang="ar" />);
      expect(screen.getByText('إدارة الموارد البشرية')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'إدارة متكاملة للموظفين ومقدمي الخدمات وفرق العمل',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText('ملفات وظيفية موحدة لكل أخصائية')
      ).toBeInTheDocument();
    });

    it('renders exact English heading, badge, and value highlights', () => {
      render(<SolutionHero solution={hrSolution} lang="en" />);
      expect(screen.getByText('HR MANAGEMENT')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Unified Workforce, Shift, and Specialist Management',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Unified specialist personnel profiles')
      ).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<SolutionHero solution={hrSolution} lang="ar" />);
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

  describe('Section B: SolutionCapabilities', () => {
    it('renders all 6 verified HR capabilities from product owner brief', () => {
      render(<SolutionCapabilities solution={hrSolution} lang="ar" />);
      expect(screen.getByText('إدارة الموظفين ومقدمي الخدمات')).toBeInTheDocument();
      expect(screen.getByText('إدارة الصلاحيات والأدوار الوظيفية')).toBeInTheDocument();
      expect(screen.getByText('تنظيم جداول العمل والورديات')).toBeInTheDocument();
      expect(screen.getByText('متابعة أداء الموظفين')).toBeInTheDocument();
      expect(screen.getByText('إدارة العمولات والمستحقات')).toBeInTheDocument();
      expect(screen.getByText('متابعة الحضور والانصراف')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(
        <SolutionCapabilities solution={hrSolution} lang="ar" />
      );
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

  describe('Section C: SolutionImpact', () => {
    it('renders operational impact points accurately', () => {
      render(<SolutionImpact solution={hrSolution} lang="ar" />);
      expect(screen.getByText('شفافية مالية مطلقة للعمولات')).toBeInTheDocument();
      expect(screen.getByText('استثمار أمثل لأوقات الأخصائيات')).toBeInTheDocument();
      expect(screen.getByText('حماية وأمان صلاحيات المنشأة')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<SolutionImpact solution={hrSolution} lang="ar" />);
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

  describe('Section D: SolutionEcosystem', () => {
    it('renders platform integration connections', () => {
      render(<SolutionEcosystem solution={hrSolution} lang="ar" />);
      expect(
        screen.getByText(/ربط مباشر مع جدول الحجوزات/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/ربط لحظي مع نقاط البيع/i)
      ).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(
        <SolutionEcosystem solution={hrSolution} lang="ar" />
      );
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

  describe('Section E: SolutionCTA', () => {
    it('renders CTA heading and working links to contact and platform', () => {
      render(<SolutionCTA solution={hrSolution} lang="ar" />);
      expect(
        screen.getByRole('link', { name: /تواصل مع فريق المبيعات/i })
      ).toHaveAttribute('href', '/contact');
      expect(
        screen.getByRole('link', { name: /استكشف كافة الحلول/i })
      ).toHaveAttribute('href', '/platform');
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<SolutionCTA solution={hrSolution} lang="ar" />);
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

