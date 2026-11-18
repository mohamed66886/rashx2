import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@rashx/ui';

describe('Badge Primitive', () => {
  it('renders label text correctly', () => {
    render(<Badge>Enterprise</Badge>);
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('renders status dot with aria-hidden="true" to preserve clean screen reader text', () => {
    const { container } = render(<Badge dot variant="success">Active</Badge>);
    const dotSpan = container.querySelector('span[aria-hidden="true"]');
    expect(dotSpan).toBeInTheDocument();
    expect(dotSpan).toHaveClass('rounded-full');
  });

  it('renders icon when provided', () => {
    render(
      <Badge icon={<span data-testid="badge-icon">★</span>}>
        Featured
      </Badge>
    );
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });
});
