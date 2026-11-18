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

    it('adds security attributes and screen-reader notice to external links', () => {
      render(
        <Link href="https://twitter.com/rashx" lang="en" external>
          Twitter
        </Link>
      );
      const link = screen.getByRole('link', { name: /twitter/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(screen.getByText('(opens in a new tab)')).toBeInTheDocument();
    });
  });
});
