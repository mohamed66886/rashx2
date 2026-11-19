'use client';

/**
 * RASHX Switch / Toggle Primitive
 *
 * Accessible sliding toggle switch for boolean settings and salon toggles.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
} from 'react';
import { cn } from '../../lib/cn';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ink' | 'peach' | 'blue';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      label,
      description,
      checked: controlledChecked,
      defaultChecked,
      size = 'md',
      variant = 'ink',
      disabled,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const switchId = id ?? generatedId;

    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
    const isChecked = isControlled ? Boolean(controlledChecked) : internalChecked;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const trackSizes = {
      sm: 'h-5 w-9 p-0.5',
      md: 'h-6 w-11 p-0.5',
      lg: 'h-7 w-13 p-1',
    }[size];

    const thumbSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-5 w-5',
    }[size];

    const thumbTranslate = {
      sm: 'translate-x-4',
      md: 'translate-x-5',
      lg: 'translate-x-6',
    }[size];

    const variantActiveColors = {
      ink: 'bg-[#54453D]',
      peach: 'bg-[#F0C5AE]',
      blue: 'bg-[#91B8C0]',
    }[variant];

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'inline-flex items-start gap-3 select-none cursor-pointer font-sans',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <div
          dir="ltr"
          className="relative inline-flex items-center shrink-0 mt-0.5"
        >
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            aria-checked={isChecked}
            className="sr-only peer"
            {...props}
          />

          {/* Track */}
          <div
            className={cn(
              trackSizes,
              'rounded-full transition-colors duration-200 flex items-center',
              isChecked ? variantActiveColors : 'bg-[#E6E1DC]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#54453D] peer-focus-visible:ring-offset-2',
            )}
          >
            {/* Thumb */}
            <div
              className={cn(
                thumbSizes,
                'rounded-full bg-white transition-transform duration-200 ease-in-out transform',
                isChecked ? thumbTranslate : 'translate-x-0',
              )}
            />
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

Switch.displayName = 'Switch';

