'use client';

/**
 * RASHX Checkbox Primitive
 *
 * Accessible custom checkbox with label & description support.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
} from 'react';
import { cn } from '../../lib/cn';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      checked,
      indeterminate = false,
      size = 'md',
      hasError = false,
      disabled,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    const boxSizes = {
      sm: 'h-4 w-4 rounded',
      md: 'h-5 w-5 rounded-md',
      lg: 'h-6 w-6 rounded-md',
    }[size];

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'inline-flex items-start gap-3 select-none cursor-pointer font-sans',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            aria-invalid={hasError ? 'true' : undefined}
            className="sr-only peer"
            {...props}
          />

          {/* Custom Styled Box (Flat & Borderless) */}
          <div
            className={cn(
              boxSizes,
              'flex items-center justify-center transition-colors duration-150',
              'bg-[#FAF9F8] peer-hover:bg-[#F2EFEB]',
              'peer-checked:bg-[#54453D] peer-checked:text-white',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#54453D] peer-focus-visible:ring-offset-2',
              hasError && 'bg-[#FEF2F2] peer-focus-visible:ring-[#DC2626]',
            )}
          >
            {indeterminate ? (
              <span className="w-2.5 h-0.5 bg-white rounded-full" />
            ) : checked ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : null}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-start">
            {label && (
              <span className="text-sm font-medium text-[#54453D] leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-[#75645B] mt-1 leading-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

