import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from '@rashx/ui';

describe('IconButton Primitive', () => {
  it('renders with enforced aria-label', () => {
    render(
      <IconButton aria-label="Close dialog" icon={<span data-testid="icon">×</span>} />
    );
    const btn = screen.getByRole('button', { name: 'Close dialog' });
    expect(btn).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <IconButton
        aria-label="Filter results"
        icon={<span>F</span>}
        onClick={handleClick}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Filter results' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state and becomes disabled when isLoading is true', () => {
    render(
      <IconButton
        aria-label="Refresh data"
        icon={<span>R</span>}
        isLoading
      />
    );
    const btn = screen.getByRole('button', { name: 'Refresh data' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});
