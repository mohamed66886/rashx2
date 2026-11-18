import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link, buildLocalizedHref } from '@rashx/ui';

describe('Link Primitive & Localization Utility', () => {
  describe('buildLocalizedHref', () => {
    it('returns clean path for Arabic default (lang="ar" or undefined)', () => {
      expect(buildLocalizedHref('/about', 'ar')).toBe('/about');
      expect(buildLocalizedHref('/pricing')).toBe('/pricing');
    });

    it('appends ?lang=en for English language', () => {
      expect(buildLocalizedHref('/about', 'en')).toBe('/about?lang=en');
    });

    it('preserves existing query parameters when appending lang=en', () => {
      expect(buildLocalizedHref('/search?q=salon', 'en')).toBe('/search?q=salon&lang=en');
    });

    it('does not modify external URLs', () => {
      expect(buildLocalizedHref('https://example.com', 'en')).toBe('https://example.com');
      expect(buildLocalizedHref('//cdn.example.com', 'en')).toBe('//cdn.example.com');
    });
  });

  describe('Link Component', () => {
    it('renders internal link correctly', () => {
      render(
        <Link href="/contact" lang="ar">
          اتصل بنا
        </Link>
      );
      const link = screen.getByRole('link', { name: /اتصل بنا/i });
      expect(link).toHaveAttribute('href', '/contact');
    });

    it('appends ?lang=en to internal link when lang is en', () => {
      render(
        <Link href="/contact" lang="en">
          Contact Us
        </Link>
      );
      const link = screen.getByRole('link', { name: /contact us/i });
      expect(link).toHaveAttribute('href', '/contact?lang=en');
    });

    it('does NOT force new tab on external links by default', () => {
      render(
        <Link href="https://example.com" lang="en">
          External Site
        </Link>
      );
      const link = screen.getByRole('link', { name: /external site/i });
      expect(link).not.toHaveAttribute('target');
      expect(link).toHaveAttribute('rel', 'noopener');
      expect(screen.queryByText('(opens in a new tab)')).not.toBeInTheDocument();
    });

    it('adds target="_blank", rel="noopener noreferrer", and sr-only notice when openInNewTab is true', () => {
      render(
        <Link href="https://twitter.com/rashx" lang="en" openInNewTab>
          Twitter
        </Link>
      );
      const link = screen.getByRole('link', { name: /twitter/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(screen.getByText('(opens in a new tab)')).toBeInTheDocument();
    });

    it('renders Arabic screen-reader notice when openInNewTab is true in Arabic context', () => {
      render(
        <Link href="https://zatca.gov.sa" lang="ar" openInNewTab>
          هيئة الزكاة والضريبة والجمارك
        </Link>
      );
      expect(screen.getByText('(يفتح في نافذة جديدة)')).toBeInTheDocument();
    });
  });
});
