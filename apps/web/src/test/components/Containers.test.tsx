import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageContainer, SectionContainer } from '@rashx/ui';

describe('Layout Containers', () => {
  describe('PageContainer', () => {
    it('renders children with default max-width xl and padding', () => {
      render(<PageContainer data-testid="page-container">Page content</PageContainer>);
      const container = screen.getByTestId('page-container');
      expect(container).toBeInTheDocument();
      expect(container.className).toContain('max-w-screen-xl');
      expect(container.className).toContain('px-4');
    });

    it('renders with custom size without padding when padded is false', () => {
      render(
        <PageContainer data-testid="page-container" size="full" padded={false}>
          Full bleed content
        </PageContainer>
      );
      const container = screen.getByTestId('page-container');
      expect(container.className).toContain('max-w-full');
      expect(container.className).not.toContain('px-4');
    });
  });

  describe('SectionContainer', () => {
    it('renders semantic section tag by default', () => {
      render(<SectionContainer data-testid="section">Section content</SectionContainer>);
      const section = screen.getByTestId('section');
      expect(section.tagName).toBe('SECTION');
      expect(section.className).toContain('py-16');
    });

    it('supports custom semantic element like article', () => {
      render(
        <SectionContainer as="article" data-testid="article" spacing="sm">
          Article content
        </SectionContainer>
      );
      const article = screen.getByTestId('article');
      expect(article.tagName).toBe('ARTICLE');
      expect(article.className).toContain('py-8');
    });
  });
});

