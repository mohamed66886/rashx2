/**
 * RASHX — Final Call To Action (Final CTA) Component Unit Test Suite
 *
 * Verifies:
 * - Proper Arabic (RTL) and English (LTR) rendering
 * - Verified navigation routes (/brand, mailto:hello@rashx.com)
 * - Required exact copy and headlines
 * - Micro trust indicators
 * - Strict adherence to zero-border and zero-shadow visual architecture
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FinalCTA } from '@/components/home/FinalCTA';

describe('RASHX — Final CTA Section Suite', () => {
  describe('Arabic (Default RTL) Mode', () => {
    it('renders exact Arabic heading, badge, description, and buttons', () => {
      render(<FinalCTA lang="ar" />);

      expect(screen.getByText('انطلاقة جديدة لصالونك')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'جاهز تنقل إدارة صالونك إلى مستوى جديد؟',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'ابدأ مع RASHX واكتشف طريقة أكثر تنظيمًا لإدارة أعمال صالونك، من المواعيد والعملاء إلى فريق العمل والعمليات اليومية.'
        )
      ).toBeInTheDocument();

      const primaryBtn = screen.getByRole('link', { name: /ابدأ الآن/ });
      expect(primaryBtn).toBeInTheDocument();
      expect(primaryBtn).toHaveAttribute('href', '/brand');

      const secondaryBtn = screen.getByRole('link', { name: /تواصل معنا/ });
      expect(secondaryBtn).toBeInTheDocument();
      expect(secondaryBtn).toHaveAttribute('href', 'mailto:hello@rashx.com');

      expect(screen.getByText('بدون عقود إلزامية')).toBeInTheDocument();
      expect(screen.getByText('إعداد وتدريب مباشر للفريق')).toBeInTheDocument();
      expect(screen.getByText('بيانات آمنة ومعزولة')).toBeInTheDocument();
    });

    it('enforces RTL direction on the section root', () => {
      const { container } = render(<FinalCTA lang="ar" />);
      const section = container.querySelector('#final-cta');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('English (?lang=en LTR) Mode', () => {
    it('renders exact English heading, badge, description, and buttons', () => {
      render(<FinalCTA lang="en" />);

      expect(screen.getByText('A NEW CHAPTER FOR YOUR SALON')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Ready to take your salon management further?',
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Get started with RASHX and discover a more organized way to manage your salon, from appointments and customers to your team and daily operations.'
        )
      ).toBeInTheDocument();

      const primaryBtn = screen.getByRole('link', { name: /Get Started/ });
      expect(primaryBtn).toBeInTheDocument();
      expect(primaryBtn).toHaveAttribute('href', '/brand?lang=en');

      const secondaryBtn = screen.getByRole('link', { name: /Contact Us/ });
      expect(secondaryBtn).toBeInTheDocument();
      expect(secondaryBtn).toHaveAttribute('href', 'mailto:hello@rashx.com');

      expect(screen.getByText('No lock-in contracts')).toBeInTheDocument();
      expect(screen.getByText('Direct team onboarding & training')).toBeInTheDocument();
      expect(screen.getByText('Encrypted & isolated data')).toBeInTheDocument();
    });

    it('enforces LTR direction on the section root', () => {
      const { container } = render(<FinalCTA lang="en" />);
      const section = container.querySelector('#final-cta');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Strict Zero Borders and Zero Shadows Compliance', () => {
    it('ensures section and all internal elements do not use decorative shadows or borders', () => {
      const { container } = render(<FinalCTA lang="ar" />);

      const section = container.querySelector('#final-cta');
      expect(section?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(section?.className).not.toMatch(/\bborder\b/);

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        expect(link.className).not.toMatch(/\bborder\b/);
      });
    });
  });
});
