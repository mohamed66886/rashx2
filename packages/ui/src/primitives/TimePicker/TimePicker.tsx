'use client';

/**
 * RASHX TimePicker Primitive
 *
 * Custom time input and selector supporting 12h/24h and salon appointment presets.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  useState,
  useRef,
  useEffect,
  useId,
} from 'react';
import { cn } from '../../lib/cn';

export interface TimePickerProps {
  value?: string; // Format: "HH:mm" e.g. "14:30"
  onChange?: (time: string) => void;
  placeholder?: string;
  lang?: 'ar' | 'en';
  format24?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
  'aria-label'?: string;
}

const COMMON_PRESETS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00'
];

export function TimePicker({
  value = '',
  onChange,
  placeholder = 'اختر الوقت...',
  lang = 'ar',
  format24 = false,
  disabled = false,
  hasError = false,
  clearable = true,
  size = 'md',
  id,
  className,
  'aria-label': ariaLabel,
}: TimePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse hours and minutes
  const [selectedHours, setSelectedHours] = useState(() => {
    if (value && value.includes(':')) {
      return parseInt(value.split(':')[0] ?? '9', 10);
    }
    return 10;
  });

  const [selectedMinutes, setSelectedMinutes] = useState(() => {
    if (value && value.includes(':')) {
      return parseInt(value.split(':')[1] ?? '0', 10);
    }
    return 0;
  });

  const [isPM, setIsPM] = useState(() => selectedHours >= 12);

  // Sync state if value prop changes
  useEffect(() => {
    if (value && value.includes(':')) {
      const h = parseInt(value.split(':')[0] ?? '9', 10);
      const m = parseInt(value.split(':')[1] ?? '0', 10);
      setSelectedHours(h);
      setSelectedMinutes(m);
      setIsPM(h >= 12);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const commitTime = (h: number, m: number) => {
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange?.(timeStr);
  };

  const handlePresetClick = (preset: string) => {
    const [h, m] = preset.split(':').map(Number);
    setSelectedHours(h!);
    setSelectedMinutes(m!);
    setIsPM(h! >= 12);
    commitTime(h!, m!);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  const formatDisplayTime = (h: number, m: number) => {
    const formattedMinutes = String(m).padStart(2, '0');
    if (format24) {
      return `${String(h).padStart(2, '0')}:${formattedMinutes}`;
    }
    const period = h >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM');
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${formattedMinutes} ${period}`;
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs rounded-md',
    md: 'h-11 px-3.5 text-sm rounded-lg',
    lg: 'h-13 px-4 text-base rounded-xl',
  }[size];

  return (
    <div ref={containerRef} className={cn('relative w-full select-none font-sans', className)}>
      {/* Trigger Button (Flat & Borderless) */}
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel ?? placeholder}
        aria-invalid={hasError ? 'true' : undefined}
        className={cn(
          'flex items-center justify-between w-full bg-white text-[#54453D] transition-all duration-150',
          'hover:bg-white focus-visible:bg-white focus-visible:outline-none',
          hasError && 'bg-[#FEF2F2]',
          disabled && 'bg-[#F2EFEB] text-[#A39890] opacity-60 cursor-not-allowed',
          sizeClasses,
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden text-start">
          {/* Clock Icon */}
          <svg className="w-4 h-4 text-[#75645B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>

          {value ? (
            <span className="font-medium text-[#54453D] dir-ltr">{formatDisplayTime(selectedHours, selectedMinutes)}</span>
          ) : (
            <span className="text-[#A39890]">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ms-2 shrink-0 text-[#75645B]">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              aria-label="مسح الوقت"
              className="p-1 rounded-md hover:bg-[#E6E1DC] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          )}
        </div>
      </button>

      {/* Time Picker Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="اختيار الوقت"
          className="absolute top-full start-0 z-50 mt-1.5 w-64 rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(84,69,61,0.08),0_1px_4px_rgba(84,69,61,0.04)] animate-dropdown transition-all origin-top"
        >
          {/* Quick Salon Appointment Presets */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A39890] block mb-2">
            {lang === 'ar' ? 'أوقات الحجز الشائعة' : 'Common Booking Slots'}
          </span>

          <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
            {COMMON_PRESETS.map((preset) => {
              const isSelected = value === preset;
              const [h, m] = preset.split(':').map(Number);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    'py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors dir-ltr',
                    isSelected
                      ? 'bg-[#54453D] text-white font-bold'
                      : 'bg-white text-[#54453D] hover:bg-[#F0C5AE]/30',
                  )}
                >
                  {formatDisplayTime(h!, m!)}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 flex items-center justify-end text-xs">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#75645B] hover:text-[#54453D] font-bold transition-colors p-1"
            >
              {lang === 'ar' ? 'تم' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

