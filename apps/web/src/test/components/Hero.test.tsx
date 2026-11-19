import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/home';

describe('RASHX Homepage Hero Section Suite', () => {
  describe('Arabic Content & RTL Verification (Default)', () => {
    it('renders exact Arabic headline with rotating benefit phrases and subtitle', () => {
      render(<Hero lang="ar" />);

      // Main Heading base & highlighted brand mark
      expect(screen.getByText('راش إكس')).toBeInTheDocument();
      expect(
        screen.getByText((_, el) => el?.textContent?.trim() === 'تحصل مع راش إكس على:')
      ).toBeInTheDocument();

      // Rotating benefit words
      expect(screen.getAllByText('راحة').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('سرعة')).toBeInTheDocument();
      expect(screen.getByText('تحكّم')).toBeInTheDocument();
      expect(screen.getByText('نمو')).toBeInTheDocument();
      expect(screen.getByText('تنظيم')).toBeInTheDocument();
      expect(screen.getByText('أرباح')).toBeInTheDocument();

      // Subtitle
      expect(
        screen.getByText(
          'RASHX منظومة رقمية متكاملة تجمع إدارة المواعيد والعملاء والموظفين والخدمات والمبيعات في مكان واحد، لتمنحك تحكمًا أكبر وتجربة أفضل لعملائك.'
        )
      ).toBeInTheDocument();
    });

    it('renders exact Arabic CTAs with verified destinations and brand colors', () => {
      render(<Hero lang="ar" />);

      // Primary CTA -> /brand with brand primary color (#F0C5AE)
      const primaryCta = screen.getByRole('link', { name: /اكتشف المنصة/i });
      expect(primaryCta).toBeInTheDocument();
      expect(primaryCta).toHaveAttribute('href', '/brand');
      expect(primaryCta.className).toContain('bg-[#F0C5AE]');
      expect(primaryCta.className).toContain('text-[#54453D]');

      // Secondary CTA -> mailto:hello@rashx.com with brand secondary color (#91B8C0)
      const secondaryCta = screen.getByRole('link', { name: /تواصل معنا/i });
      expect(secondaryCta).toBeInTheDocument();
      expect(secondaryCta).toHaveAttribute('href', 'mailto:hello@rashx.com');
      expect(secondaryCta.className).toContain('bg-[#91B8C0]');
      expect(secondaryCta.className).toContain('text-[#54453D]');
    });

    it('enforces RTL direction on the hero container', () => {
      const { container } = render(<Hero lang="ar" />);
      const section = container.querySelector('#hero');
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English Content & LTR Verification (?lang=en)', () => {
    it('renders exact English headline with rotating benefit phrases and subtitle', () => {
      render(<Hero lang="en" />);

      // Main Heading base & highlighted brand mark
      expect(screen.getByText('RASHX')).toBeInTheDocument();
      expect(
        screen.getByText((_, el) => el?.textContent?.trim() === 'With RASHX, you get:')
      ).toBeInTheDocument();

      // Rotating benefit words
      expect(screen.getAllByText('Peace').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
      expect(screen.getByText('Order')).toBeInTheDocument();
      expect(screen.getByText('Profit')).toBeInTheDocument();

      // Subtitle
      expect(
        screen.getByText(
          'RASHX brings appointments, customers, staff, services, and sales together in one integrated platform, giving you greater control and a better customer experience.'
        )
      ).toBeInTheDocument();
    });

    it('renders exact English CTAs with verified destinations and brand colors', () => {
      render(<Hero lang="en" />);

      // Primary CTA -> /brand?lang=en with brand primary color (#F0C5AE)
      const primaryCta = screen.getByRole('link', { name: /Explore the Platform/i });
      expect(primaryCta).toBeInTheDocument();
      expect(primaryCta).toHaveAttribute('href', '/brand?lang=en');
      expect(primaryCta.className).toContain('bg-[#F0C5AE]');
      expect(primaryCta.className).toContain('text-[#54453D]');

      // Secondary CTA -> mailto:hello@rashx.com with brand secondary color (#91B8C0)
      const secondaryCta = screen.getByRole('link', { name: /Contact Us/i });
      expect(secondaryCta).toBeInTheDocument();
      expect(secondaryCta).toHaveAttribute('href', 'mailto:hello@rashx.com');
      expect(secondaryCta.className).toContain('bg-[#91B8C0]');
      expect(secondaryCta.className).toContain('text-[#54453D]');
    });

    it('enforces LTR direction on the hero container', () => {
      const { container } = render(<Hero lang="en" />);
      const section = container.querySelector('#hero');
      expect(section).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Strict Design Rules & Border/Shadow Audit', () => {
    it('ensures hero section and CTA buttons do not use decorative shadows or borders', () => {
      const { container } = render(<Hero lang="ar" />);

      const section = container.querySelector('#hero');
      expect(section?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(section?.className).not.toMatch(/\bborder\b/);

      const primaryCta = screen.getByRole('link', { name: /اكتشف المنصة/i });
      expect(primaryCta.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(primaryCta.className).not.toMatch(/\bborder\b/);

      const secondaryCta = screen.getByRole('link', { name: /تواصل معنا/i });
      expect(secondaryCta.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(secondaryCta.className).not.toMatch(/\bborder\b/);
    });
  });
});
