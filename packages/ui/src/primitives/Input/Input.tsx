'use client';

/**
 * RASHX Input Primitive
 *
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Features:
 * - High-legibility text input supporting all standard HTML input types
 * - Start and End adornment slots for icons, prefixes, and currency tags
 * - Password visibility toggle (built-in accessible show/hide button)
 * - Clearable action button with automatic display when value is present
 * - Distinct, crisp flat contrast (white fill on cream cards or vice versa)
 * - Fully accessible with focus-within ring (zero decorative borders or shadows)
 * - Full bidirectional support (RTL Arabic / LTR Latin)
 */

import {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export const inputContainerVariants = cva(
  'group flex items-center w-full font-sans transition-all duration-150 outline-none',
  {
    variants: {
      size: {
        sm: 'h-9 px-2.5 text-xs rounded-md',
        md: 'h-11 px-3.5 text-sm rounded-lg',
        lg: 'h-13 px-4 text-base rounded-xl',
      },
      variant: {
        default: 'bg-white text-[#54453D]',
        surface: 'bg-white text-[#54453D]',
        peach: 'bg-[#F0C5AE]/20 text-[#54453D]',
        blue: 'bg-[#91B8C0]/20 text-[#54453D]',
      },
      hasError: {
        true: 'bg-[#FEF2F2] text-[#991B1B]',
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

export const inputVariants = inputContainerVariants;

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputContainerVariants> {
  /** Start icon, prefix, or adornment */
  startAdornment?: ReactNode;
  /** End icon, suffix, or action button */
  endAdornment?: ReactNode;
  /** When true, enables password visibility toggle button (for type="password") */
  isPassword?: boolean;
  /** When true, shows an accessible clear button when text is present */
  clearable?: boolean;
  /** Callback fired when clear button is clicked */
  onClear?: () => void;
  /** Explicit error state */
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size = 'md',
      variant = 'default',
      hasError = false,
      startAdornment,
      endAdornment,
      isPassword = false,
      clearable = false,
      onClear,
      value,
      defaultValue,
      disabled,
      id,
      dir,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordMode = isPassword || type === 'password';
    const computedType = isPasswordMode ? (showPassword ? 'text' : 'password') : type;
    const hasValue =
      (value !== undefined && value !== '' && value !== null) ||
      (defaultValue !== undefined && defaultValue !== '' && defaultValue !== null);

    const handleClearClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onClear?.();
    };

    const togglePasswordVisibility = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setShowPassword((prev) => !prev);
    };

    // Auto-detect LTR direction for email, url, tel, or password
    const isLtrType = type === 'email' || type === 'url';
    const computedDir = dir ?? (isLtrType ? 'ltr' : undefined);

    return (
      <div
        className={cn(
          inputContainerVariants({ size, variant, hasError }),
          disabled && 'bg-[#F2EFEB] opacity-60 cursor-not-allowed',
          className,
        )}
      >
        {/* Start Adornment */}
        {startAdornment && (
          <div className="flex items-center pe-2 shrink-0 select-none text-[#75645B]">
            {startAdornment}
          </div>
        )}

        {/* Core Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={computedType}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          dir={computedDir}
          placeholder={placeholder}
          aria-invalid={hasError ? 'true' : undefined}
          className={cn(
            'flex-1 min-w-0 h-full bg-transparent text-[#54453D] placeholder:text-[#A39890] outline-none font-sans',
            hasError && 'text-[#991B1B] placeholder:text-[#F87171]',
            isLtrType && 'text-start dir-ltr',
          )}
          {...props}
        />

        {/* End Adornments & Interactive Controls */}
        <div className="flex items-center ps-2 shrink-0 gap-1.5 text-[#75645B]">
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClearClick}
              tabIndex={-1}
              aria-label="مسح النص"
              className="p-1 rounded-md text-[#75645B] hover:text-[#54453D] hover:bg-[#F2EFEB] transition-colors focus:outline-none"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {isPasswordMode && !disabled && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              className="p-1 rounded-md text-[#75645B] hover:text-[#54453D] hover:bg-[#F2EFEB] transition-colors focus:outline-none"
            >
              {showPassword ? (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}

          {endAdornment}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';
