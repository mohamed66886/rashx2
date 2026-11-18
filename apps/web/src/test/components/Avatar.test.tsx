import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from '@rashx/ui';

describe('Avatar Primitive', () => {
  it('renders fallback initials when no src is provided', () => {
    render(<Avatar alt="Mohamed Rashad" fallback="MR" />);
    const avatar = screen.getByRole('img', { name: 'Mohamed Rashad' });
    expect(avatar).toBeInTheDocument();
    expect(screen.getByText('MR')).toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" fallback="UA" />);
    const img = screen.getByAltText('User Avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('falls back to initials when image trigger onError', () => {
    render(<Avatar src="https://example.com/broken.jpg" alt="Broken User" fallback="BU" />);
    const img = screen.getByAltText('Broken User');
    fireEvent.error(img);
    expect(screen.getByText('BU')).toBeInTheDocument();
  });
});
