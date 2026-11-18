/**
 * RASHX Typography Component
 *
 * Polymorphic typographic primitive decoupling semantic HTML structure
 * from visual scale tokens. Built for high-legibility Arabic & English text.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export const typographyVariants = cva('text-start', {
  variants: {
    variant: {
      'display-1':
        'text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.15]',
      'display-2':
        'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2]',
      h1: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.25]',
      h2: 'text-2xl md:text-3xl font-bold tracking-tight leading-[1.3]',
      h3: 'text-xl md:text-2xl font-semibold leading-[1.35]',
      h4: 'text-lg md:text-xl font-semibold leading-[1.4]',
      h5: 'text-base md:text-lg font-medium leading-[1.45]',
      h6: 'text-sm md:text-base font-medium leading-[1.5]',
      'body-lg': 'text-lg md:text-xl font-normal leading-[1.7]',
      body: 'text-base font-normal leading-[1.65]',
      'body-sm': 'text-sm font-normal leading-[1.6]',
      caption: 'text-xs font-normal text-[--surface-muted-foreground] leading-[1.5]',
      label: 'text-xs font-medium uppercase tracking-wider leading-none select-none',
    },
    color: {
      default: 'text-[--surface-foreground]',
      muted: 'text-[--surface-muted-foreground]',
      accent: 'text-[--color-accent]',
      primary: 'text-[--color-primary]',
      inverse: 'text-white',
      success: 'text-[--color-success]',
      warning: 'text-[--color-warning]',
      error: 'text-[--color-error]',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
    align: 'start',
  },
});

export type TypographyElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'label';

export interface TypographyProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  /** The semantic HTML tag to render */
  as?: TypographyElement;
  children: ReactNode;
}

const defaultElementMap: Record<
  NonNullable<VariantProps<typeof typographyVariants>['variant']>,
  TypographyElement
> = {
  'display-1': 'h1',
  'display-2': 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  label: 'span',
};

export function Typography({
  as,
  variant = 'body',
  color,
  align,
  className,
  children,
  ...props
}: TypographyProps) {
  const Component = (as ?? defaultElementMap[variant ?? 'body']) as ElementType;

  return (
    <Component
      className={cn(typographyVariants({ variant, color, align, className }))}
      {...props}
    >
      {children}
    </Component>
  );
}
