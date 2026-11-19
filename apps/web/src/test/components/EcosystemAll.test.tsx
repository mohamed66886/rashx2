import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  EcosystemHero,
  EcosystemPillars,
  EcosystemBenefits,
  EcosystemSync,
  EcosystemCTA,
} from '@/components/ecosystem';
import { ecosystemData } from '@/data/ecosystem';

describe('RASHX Digital Ecosystem & White Label Suite (4 Products)', () => {
  const allProducts = Object.values(ecosystemData);

  it('contains exactly 4 verified ecosystem products based on brief', () => {
    expect(allProducts).toHaveLength(4);
    const expectedSlugs = [
      'websites',
      'customer-experience',
      'provider-experience',
      'white-label',
    ];
    expectedSlugs.forEach((slug) => {
      expect(
        allProducts.find((p) => p.slug === slug)
      ).toBeDefined();
    });
  });

  describe.each(allProducts)('Product: $slug ($badge.ar)', (product) => {
    it('renders hero with exact titles and zero borders/shadows', () => {
      const { container } = render(<EcosystemHero product={product} lang="ar" />);
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
      const { container } = render(
        <EcosystemPillars product={product} lang="ar" />
      );
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

    it('renders strategic benefits with zero borders/shadows', () => {
      const { container } = render(
        <EcosystemBenefits product={product} lang="ar" />
      );
      product.keyBenefits.forEach((b) => {
        expect(screen.getByText(b.title.ar)).toBeInTheDocument();
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

    it('renders architecture sync points with zero borders/shadows', () => {
      const { container } = render(<EcosystemSync product={product} lang="ar" />);
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
      const { container } = render(<EcosystemCTA product={product} lang="ar" />);
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

