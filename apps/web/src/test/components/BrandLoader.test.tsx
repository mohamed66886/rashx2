import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandLoader } from '@rashx/ui';

describe('BrandLoader Component', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with role="progressbar" and accessible attributes', () => {
    render(<BrandLoader forceShow lang="ar" />);

    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute('aria-label', 'جاري التحميل');
    expect(loader).toHaveAttribute('aria-valuemin', '0');
    expect(loader).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders Arabic initial status message', () => {
    render(<BrandLoader forceShow lang="ar" />);

    expect(screen.getByText('جاري التحضير')).toBeInTheDocument();
  });

  it('renders English initial status message and label when lang="en"', () => {
    render(<BrandLoader forceShow lang="en" />);

    const loader = screen.getByRole('progressbar');
    expect(loader).toHaveAttribute('aria-label', 'Loading RASHX');
    expect(screen.getByText('Preparing...')).toBeInTheDocument();
  });

  it('exposes window.RashxLoader API with ready and replay functions', () => {
    render(<BrandLoader forceShow />);

    const api = (window as unknown as { RashxLoader?: { ready: () => void; replay: () => void } })
      .RashxLoader;
    expect(api).toBeDefined();
    expect(typeof api?.ready).toBe('function');
    expect(typeof api?.replay).toBe('function');
  });

  it('renders 3 curtain panels and SVG mark', () => {
    const { container } = render(<BrandLoader forceShow />);

    expect(container.querySelector('.rashx-loader-p1')).toBeInTheDocument();
    expect(container.querySelector('.rashx-loader-p2')).toBeInTheDocument();
    expect(container.querySelector('.rashx-loader-p3')).toBeInTheDocument();
    expect(container.querySelector('.rashx-loader-mark')).toBeInTheDocument();
    expect(container.querySelector('.rashx-loader-bar')).toBeInTheDocument();
  });
});

