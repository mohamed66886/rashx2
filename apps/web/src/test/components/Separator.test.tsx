import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Separator } from '@rashx/ui';

describe('Separator Primitive', () => {
  it('renders horizontal separator as hr with role="none" by default (decorative)', () => {
    const { container } = render(<Separator />);
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
    expect(hr).toHaveAttribute('role', 'none');
    expect(hr).toHaveAttribute('aria-hidden', 'true');
    expect(hr).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders vertical separator as div with role="separator" when decorative is false', () => {
    const { container } = render(<Separator orientation="vertical" decorative={false} />);
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div).toHaveAttribute('role', 'separator');
    expect(div).toHaveAttribute('aria-orientation', 'vertical');
  });
});

