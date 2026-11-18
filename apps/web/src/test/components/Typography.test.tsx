import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography } from '@rashx/ui';

describe('Typography Primitive', () => {
  it('renders default body variant as paragraph', () => {
    render(<Typography>Body content</Typography>);
    const el = screen.getByText('Body content');
    expect(el.tagName).toBe('P');
  });

  it('renders h1 variant with h1 tag by default', () => {
    render(<Typography variant="h1">Headline</Typography>);
    const el = screen.getByRole('heading', { level: 1, name: 'Headline' });
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe('H1');
  });

  it('supports polymorphic "as" override', () => {
    render(
      <Typography variant="h1" as="span">
        Custom Span Headline
      </Typography>
    );
    const el = screen.getByText('Custom Span Headline');
    expect(el.tagName).toBe('SPAN');
  });

  it('applies color variants correctly', () => {
    render(
      <Typography variant="body" color="accent">
        Accent text
      </Typography>
    );
    const el = screen.getByText('Accent text');
    expect(el.className).toContain('text-[--color-accent]');
  });
});
