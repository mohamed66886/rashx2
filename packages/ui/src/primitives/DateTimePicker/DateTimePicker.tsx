'use client';

/**
 * RASHX DateTimePicker Primitive
 *
 * Combined Day, Date & Time appointment booking selector.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  useState,
  useRef,
  useEffect,
  useId,
} from 'react';
import { cn } from '../../lib/cn';
import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';

export interface DateTimePickerProps {
  dateValue?: Date | null;
  timeValue?: string;
  onDateChange?: (date: Date | null) => void;
  onTimeChange?: (time: string) => void;
  lang?: 'ar' | 'en';
  datePlaceholder?: string;
  timePlaceholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
}

export function DateTimePicker({
  dateValue,
  timeValue = '',
  onDateChange,
  onTimeChange,
  lang = 'ar',
  datePlaceholder,
  timePlaceholder,
  disabled = false,
  hasError = false,
  size = 'md',
  className,
}: DateTimePickerProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2 w-full', className)}>
      <DatePicker
        value={dateValue}
        onChange={onDateChange}
        placeholder={datePlaceholder ?? (lang === 'ar' ? 'حدد اليوم والتاريخ...' : 'Select Date...')}
        lang={lang}
        disabled={disabled}
        hasError={hasError}
        size={size}
      />
      <TimePicker
        value={timeValue}
        onChange={onTimeChange}
        placeholder={timePlaceholder ?? (lang === 'ar' ? 'حدد وقت الحجز...' : 'Select Time...')}
        lang={lang}
        disabled={disabled}
        hasError={hasError}
        size={size}
      />
    </div>
  );
}

