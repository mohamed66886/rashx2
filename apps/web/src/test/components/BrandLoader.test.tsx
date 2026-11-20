import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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

  it('completes animation, applies done and gone classes, and calls onComplete', () => {
    const onComplete = vi.fn();
    const { container } = render(<BrandLoader forceShow onComplete={onComplete} />);

    act(() => {
      vi.runAllTimers();
    });

    const loader = container.querySelector('#rashx-loader');
    expect(loader).toBeInTheDocument();
    expect(loader?.classList.contains('done')).toBe(true);
    expect(loader?.classList.contains('gone')).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('allows replay through window.RashxLoader.replay()', () => {
    const onComplete = vi.fn();
    const { container } = render(<BrandLoader forceShow onComplete={onComplete} />);

    act(() => {
      vi.runAllTimers();
    });
    expect(onComplete).toHaveBeenCalledTimes(1);

    const api = (window as unknown as { RashxLoader?: { replay: () => void } }).RashxLoader;
    expect(api?.replay).toBeDefined();

    // Replay
    act(() => {
      api?.replay();
      vi.runAllTimers();
    });

    const loader = container.querySelector('#rashx-loader');
    expect(loader?.classList.contains('done')).toBe(true);
    expect(loader?.classList.contains('gone')).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it('respects oncePerSession when sessionStorage has seen value', () => {
    sessionStorage.setItem('rashx_loader_shown', 'true');
    const { container } = render(<BrandLoader oncePerSession />);

    const loader = container.querySelector('#rashx-loader');
    expect(loader?.classList.contains('gone')).toBe(true);
  });
});

