'use client';

/**
 * RASHX Radio & RadioGroup Primitive
 *
 * Accessible radio button and group component supporting standard and card layouts.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  createContext,
  useContext,
} from 'react';
import { cn } from '../../lib/cn';

interface RadioContextType {
  name?: string;
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}

const RadioContext = createContext<RadioContextType | null>(null);

export interface RadioGroupProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  disabled,
  className,
  children,
  'aria-label': ariaLabel,
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <RadioContext.Provider value={{ name: groupName, value, onChange, disabled }}>
      <div role="radiogroup" aria-label={ariaLabel} className={cn('space-y-2 font-sans', className)}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  variant?: 'default' | 'card';
  size?: 'sm' | 'md' | 'lg';
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      value,
      label,
      description,
      variant = 'default',
      size = 'md',
      disabled: localDisabled,
      id,
      ...props
    },
    ref,
  ) => {
    const context = useContext(RadioContext);
    const generatedId = useId();
    const radioId = id ?? generatedId;

    const isControlled = context !== null;
    const isChecked = isControlled ? context.value === value : props.checked;
    const isDisabled = localDisabled || context?.disabled;

    const handleChange = () => {
      context?.onChange?.(value);
    };

    const dotSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }[size];

    if (variant === 'card') {
      return (
        <label
          htmlFor={radioId}
          className={cn(
            'flex items-start gap-3 p-3.5 rounded-xl cursor-pointer select-none transition-colors duration-150',
            isChecked ? 'bg-[#F0C5AE]/30 font-semibold text-[#54453D]' : 'bg-[#FAF9F8] hover:bg-[#F2EFEB] text-[#54453D]',
            isDisabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
        >
          <input
            ref={ref}
            type="radio"
            id={radioId}
            name={context?.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              dotSizes,
              'shrink-0 mt-0.5 rounded-full flex items-center justify-center transition-colors',
              'bg-[#E6E1DC] peer-checked:bg-[#54453D]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#54453D] peer-focus-visible:ring-offset-2',
            )}
          >
            {isChecked && <span className="h-2 w-2 rounded-full bg-white" />}
          </div>

          <div className="flex flex-col text-start">
            {label && <span className="text-sm font-medium leading-tight">{label}</span>}
            {description && <span className="text-xs text-[#75645B] mt-1 leading-normal">{description}</span>}
          </div>
        </label>
      );
    }

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'inline-flex items-start gap-3 select-none cursor-pointer',
          isDisabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            name={context?.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            className="sr-only peer"
            {...props}
          />

          <div
            className={cn(
              dotSizes,
              'rounded-full flex items-center justify-center transition-colors',
              'bg-[#FAF9F8] peer-hover:bg-[#F2EFEB]',
              'peer-checked:bg-[#54453D]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#54453D] peer-focus-visible:ring-offset-2',
            )}
          >
            {isChecked && <span className="h-2 w-2 rounded-full bg-white" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-start">
            {label && <span className="text-sm font-medium text-[#54453D] leading-tight">{label}</span>}
            {description && <span className="text-xs text-[#75645B] mt-1 leading-normal">{description}</span>}
          </div>
        )}
      </label>
    );
  },
);

Radio.displayName = 'Radio';

