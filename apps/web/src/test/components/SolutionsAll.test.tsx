import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SolutionHero,
  SolutionCapabilities,
  SolutionImpact,
  SolutionEcosystem,
  SolutionCTA,
} from '@/components/solutions';
import { solutionsData, type SolutionKey } from '@/data/solutions';

describe('RASHX All 10 Solutions Verification Suite', () => {
  const allSolutions = Object.values(solutionsData);

  it('contains exactly 10 verified solutions based on product owner specification', () => {
    expect(allSolutions).toHaveLength(10);
    const expectedSlugs: SolutionKey[] = [
      'hr',
      'crm',
      'booking',
      'services',
      'sales',
      'purchasing',
      'inventory',
      'loyalty',
      'notifications',
      'analytics',
    ];
    expectedSlugs.forEach((slug) => {
      expect(solutionsData[slug]).toBeDefined();
      expect(solutionsData[slug]?.capabilities.length).toBeGreaterThanOrEqual(4);
      expect(solutionsData[slug]?.impacts.length).toBe(3);
    });
  });

  describe.each(allSolutions)('Solution: $slug ($badge.ar)', (solution) => {
    it('renders hero with exact titles and zero borders/shadows', () => {
      const { container } = render(<SolutionHero solution={solution} lang="ar" />);
      expect(screen.getByText(solution.badge.ar)).toBeInTheDocument();
      expect(screen.getByText(solution.title.ar)).toBeInTheDocument();

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

    it('renders all capabilities faithfully and cleanly', () => {
      const { container } = render(
        <SolutionCapabilities solution={solution} lang="ar" />
      );
      solution.capabilities.forEach((cap) => {
        expect(screen.getByText(cap.title.ar)).toBeInTheDocument();
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

    it('renders operational impacts with zero borders/shadows', () => {
      const { container } = render(<SolutionImpact solution={solution} lang="ar" />);
      solution.impacts.forEach((imp) => {
        expect(screen.getByText(imp.title.ar)).toBeInTheDocument();
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

    it('renders ecosystem integrations with zero borders/shadows', () => {
      const { container } = render(
        <SolutionEcosystem solution={solution} lang="ar" />
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

    it('renders CTA with working links and zero borders/shadows', () => {
      const { container } = render(<SolutionCTA solution={solution} lang="ar" />);
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

