/**
 * RASHX — Minimal SectionTitle Component
 *
 * Official section heading primitive for RASHX corporate website and landing pages.
 * Minimal, accessible, borderless, and shadowless.
 *
 * Typography: Ping AR + LT (via font-sans / font-brand)
 * Palette: Official Brand Ink (#54453D) & Warm Terracotta (#C78360)
 */

import { cn } from '@rashx/ui';
import type { ElementType, HTMLAttributes } from 'react';

export type SectionTitleAlign = 'start' | 'center';
export type SectionHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface SectionTitleProps extends HTMLAttributes<HTMLDivElement> {
  /** The main section title text (required) */
  title: string;
  /** Optional eyebrow label rendered above the title */
  eyebrow?: string;
  /** Alignment of the heading: 'start' (default) or 'center' */
  align?: SectionTitleAlign;
  /** Optional semantic HTML heading tag (default: 'h2') */
  as?: SectionHeadingLevel;
  /** Optional additional class names applied to the container */
  className?: string;
}

export function SectionTitle({
  title,
  eyebrow,
  align = 'start',
  as = 'h2',
  className,
  ...props
}: SectionTitleProps) {
  const HeadingTag = as as ElementType;
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col',
        isCenter ? 'items-center text-center' : 'items-start text-start',
        className
      )}
      {...props}
    >
      {eyebrow && (
        <span className="mb-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#C78360] select-none">
          {eyebrow}
        </span>
      )}
      <HeadingTag className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold tracking-tight text-[#54453D] leading-[1.25] break-words text-balance">
        {title}
      </HeadingTag>
    </div>
  );
}
