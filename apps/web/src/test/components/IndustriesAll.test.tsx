import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  IndustryHero,
  IndustryChallenges,
  IndustrySolutions,
  IndustryFeatures,
  IndustryCTA,
} from '@/components/industries';
import { industriesData } from '@/data/industries';

describe('RASHX Specialized Industries Suite (6 Sectors)', () => {
  const allIndustries = Object.values(industriesData);

  it('contains exactly 6 verified industries based on the route registry', () => {
    expect(allIndustries).toHaveLength(6);
    const expectedSlugs = [
      'beauty-salons',
      'barbershops',
      'beauty-centers',
      'spa',
      'personal-care',
      'multi-branch',
    ];
    expectedSlugs.forEach((slug) => {
      expect(allIndustries.find((i) => i.slug === slug)).toBeDefined();
    });
  });

  describe.each(allIndustries)('Industry: $slug ($badge.ar)', (industry) => {
    it('renders hero with exact titles and zero borders/shadows', () => {
      const { container } = render(<IndustryHero industry={industry} lang="ar" />);
      expect(screen.getByText(industry.badge.ar)).toBeInTheDocument();
      expect(screen.getByText(industry.title.ar)).toBeInTheDocument();

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

    it('renders challenges cleanly with zero borders/shadows', () => {
      const { container } = render(
        <IndustryChallenges industry={industry} lang="ar" />
      );
      expect(screen.getByText(industry.challengesTitle.ar)).toBeInTheDocument();
      industry.challenges.forEach((c) => {
        expect(screen.getByText(c.title.ar)).toBeInTheDocument();
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

    it('renders solutions cleanly with zero borders/shadows', () => {
      const { container } = render(
        <IndustrySolutions industry={industry} lang="ar" />
      );
      expect(screen.getByText(industry.solutionsTitle.ar)).toBeInTheDocument();
      industry.solutions.forEach((s) => {
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

    it('renders features cleanly with zero borders/shadows', () => {
      const { container } = render(
        <IndustryFeatures industry={industry} lang="ar" />
      );
      industry.keyFeatures.forEach((f) => {
        expect(screen.getByText(f.ar)).toBeInTheDocument();
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

    it('renders CTA with zero borders/shadows', () => {
      const { container } = render(<IndustryCTA industry={industry} lang="ar" />);
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

