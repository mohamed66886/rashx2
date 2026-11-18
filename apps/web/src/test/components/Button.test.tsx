import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@rashx/ui';

describe('Button Primitive', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state properly', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('displays loading spinner and sets aria-busy when isLoading is true', () => {
    render(<Button isLoading>Processing</Button>);
    const btn = screen.getByRole('button', { name: /processing/i });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('renders left and right icons when provided', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">←</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        With Icons
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
