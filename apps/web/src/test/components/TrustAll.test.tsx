import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  TrustHero,
  TrustPillars,
  TrustImpact,
  TrustRegulatory,
  TrustCTA,
} from '@/components/trust';
import { trustData } from '@/data/trust';

describe('RASHX Trust, Compliance & Security Suite (2 Products)', () => {
  const allProducts = Object.values(trustData);

  it('contains exactly 2 verified trust products based on canonical brief', () => {
    expect(allProducts).toHaveLength(2);
    const expectedSlugs = ['e-invoicing', 'security'];
    expectedSlugs.forEach((slug) => {
      expect(allProducts.find((p) => p.slug === slug)).toBeDefined();
    });
  });

  describe.each(allProducts)('Product: $slug ($badge.ar)', (product) => {
    it('renders hero with exact titles and zero borders/shadows', () => {
      const { container } = render(<TrustHero product={product} lang="ar" />);
      expect(screen.getByText(product.badge.ar)).toBeInTheDocument();
      expect(screen.getByText(product.title.ar)).toBeInTheDocument();

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

    it('renders all pillars faithfully and cleanly', () => {
      const { container } = render(<TrustPillars product={product} lang="ar" />);
      product.pillars.forEach((pillar) => {
        expect(screen.getByText(pillar.title.ar)).toBeInTheDocument();
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

    it('renders impact points with zero borders/shadows', () => {
      const { container } = render(<TrustImpact product={product} lang="ar" />);
      product.impacts.forEach((impact) => {
        expect(screen.getByText(impact.title.ar)).toBeInTheDocument();
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

    it('renders regulatory section with zero borders/shadows', () => {
      const { container } = render(<TrustRegulatory product={product} lang="ar" />);
      expect(screen.getByText(product.regulatoryTitle.ar)).toBeInTheDocument();

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
      const { container } = render(<TrustCTA product={product} lang="ar" />);
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

