'use client';

/**
 * RASHX Textarea Primitive
 *
 * Multi-line text input with character counting and auto-resize.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  forwardRef,
  useId,
  type TextareaHTMLAttributes,
  type ChangeEvent,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export const textareaVariants = cva(
  'w-full font-sans text-[#54453D] placeholder:text-[#A39890] transition-all duration-150 outline-none disabled:bg-[#F2EFEB] disabled:text-[#A39890] disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'p-2.5 text-xs rounded-md min-h-[72px]',
        md: 'p-3 text-sm rounded-lg min-h-[96px]',
        lg: 'p-4 text-base rounded-xl min-h-[120px]',
      },
      variant: {
        default: 'bg-white hover:bg-white text-[#54453D] focus:bg-white',
        surface: 'bg-[#FAF9F8] hover:bg-[#F2EFEB] text-[#54453D] focus:bg-white',
      },
      hasError: {
        true: 'bg-[#FEF2F2] text-[#991B1B] placeholder:text-[#F87171]',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      hasError: false,
    },
  },
);

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  /** Shows character count when maxLength is set */
  showCount?: boolean;
  /** Explicit error state */
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      hasError = false,
      showCount = false,
      maxLength,
      value,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          onChange={onChange}
          aria-invalid={hasError ? 'true' : undefined}
          className={cn(textareaVariants({ size, variant, hasError }), className)}
          {...props}
        />

        {showCount && maxLength !== undefined && (
          <div className="flex justify-end mt-1 text-[11px] font-medium text-[#75645B] select-none">
            <span>
              {currentLength} / {maxLength}
            </span>
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

