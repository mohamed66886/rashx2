'use client';

/**
 * RASHX FormField Component
 *
 * Accessible wrapper connecting Label, Input, HelperText, and ErrorMessage.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  useId,
  type ReactNode,
  type HTMLAttributes,
  cloneElement,
  isValidElement,
} from 'react';
import { cn } from '../../lib/cn';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  children: ReactNode;
}

export function FormField({
  label,
  helperText,
  errorMessage,
  required = false,
  disabled = false,
  id,
  className,
  children,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  const hasError = Boolean(errorMessage);

  return (
    <div className={cn('w-full space-y-1.5 font-sans', className)} {...props}>
      {/* Label */}
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-xs font-semibold text-[#54453D] leading-tight select-none',
            disabled && 'opacity-60',
          )}
        >
          {label}
          {required && <span className="ms-1 text-[#DC2626] font-bold">*</span>}
        </label>
      )}

      {/* Input Child Slot */}
      <div>
        {isValidElement<{ id?: string; hasError?: boolean; disabled?: boolean; 'aria-describedby'?: string }>(
          children,
        )
          ? cloneElement(children, {
              id: children.props.id ?? fieldId,
              hasError: children.props.hasError ?? hasError,
              disabled: children.props.disabled ?? disabled,
              'aria-describedby': cn(
                helperText && helperId,
                errorMessage && errorId,
                children.props['aria-describedby'],
              ),
            })
          : children}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs text-[#DC2626] font-medium mt-1 select-none"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </p>
      )}

      {/* Helper Text (When no error) */}
      {!errorMessage && helperText && (
        <p id={helperId} className="text-xs text-[#75645B] mt-1 select-none">
          {helperText}
        </p>
      )}
    </div>
  );
}

