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
  /** Whether to render the official RASHX wordmark as a subtle background watermark (default: true) */
  withWordmark?: boolean;
  /** Optional additional class names applied to the container */
  className?: string;
}

export function SectionTitle({
  title,
  eyebrow,
  align = 'start',
  as = 'h2',
  withWordmark = true,
  className,
  ...props
}: SectionTitleProps) {
  const HeadingTag = as as ElementType;
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'relative isolate flex flex-col',
        isCenter ? 'items-center text-center' : 'items-start text-start',
        className
      )}
      {...props}
    >
      {/* Background Official RASHX Wordmark Watermark */}
      {withWordmark && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -z-10 select-none overflow-hidden',
            isCenter
              ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
              : 'start-0 top-1/2 -translate-y-1/2'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo/wordmark/wordmark-ink.svg"
            alt=""
            className="h-14 sm:h-20 md:h-24 lg:h-28 w-auto max-w-none opacity-[0.05] object-contain select-none"
            draggable={false}
          />
        </div>
      )}

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

