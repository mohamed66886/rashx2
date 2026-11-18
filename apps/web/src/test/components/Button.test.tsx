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

  it('triggers onClick when focused and activated via keyboard (Enter / Space)', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Keyboard Action</Button>);

    const btn = screen.getByRole('button', { name: /keyboard action/i });
    btn.focus();
    expect(btn).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('handles disabled state properly and prevents keyboard activation', async () => {
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

  it('displays loading spinner and sets aria-busy and aria-disabled when isLoading is true', () => {
    render(<Button isLoading>Processing</Button>);
    const btn = screen.getByRole('button', { name: /processing/i });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('renders start and end icons when provided with bidirectional slot alignment', () => {
    render(
      <Button
        startIcon={<span data-testid="start-icon">★</span>}
        endIcon={<span data-testid="end-icon">→</span>}
      >
        With Icons
      </Button>
    );
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('enforces visible focus outline styles', () => {
    render(<Button>Focus Target</Button>);
    const btn = screen.getByRole('button', { name: /focus target/i });
    expect(btn.className).toContain('focus-visible:ring-2');
  });
});
