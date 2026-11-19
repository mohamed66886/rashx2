'use client';

/**
 * RASHX DatePicker Primitive
 *
 * Custom localized calendar date selection component.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  useState,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';

export interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  lang?: 'ar' | 'en';
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  hasError?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
  'aria-label'?: string;
}

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES_AR = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
const WEEKDAY_NAMES_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function DatePicker({
  value,
  onChange,
  placeholder = 'اختر التاريخ...',
  lang = 'ar',
  minDate,
  maxDate,
  disabled = false,
  hasError = false,
  clearable = true,
  size = 'md',
  id,
  className,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const parsedDate = value ? (typeof value === 'string' ? new Date(value) : value) : null;
  const initialYear = parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = parsedDate ? parsedDate.getMonth() : new Date().getMonth();

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Update view when value changes
  useEffect(() => {
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [value]);

  const monthNames = lang === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  const weekdayNames = lang === 'ar' ? WEEKDAY_NAMES_AR : WEEKDAY_NAMES_EN;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    onChange?.(selected);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    onChange?.(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  // Align week to Saturday in Arabic
  const startOffset = (firstDayOfMonth + 1) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Format date display
  const formatDateDisplay = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    if (lang === 'ar') {
      return `${d} ${monthNames[date.getMonth()]} ${y}`;
    }
    return `${y}-${m}-${d}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  const isSelectedDay = (day: number) => {
    if (!parsedDate || isNaN(parsedDate.getTime())) return false;
    return (
      parsedDate.getDate() === day &&
      parsedDate.getMonth() === viewMonth &&
      parsedDate.getFullYear() === viewYear
    );
  };

  const isDayDisabled = (day: number) => {
    const target = new Date(viewYear, viewMonth, day);
    if (minDate && target < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && target > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
    return false;
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
          {/* Calendar Icon */}
          <svg className="w-4 h-4 text-[#75645B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>

          {parsedDate && !isNaN(parsedDate.getTime()) ? (
            <span className="font-medium text-[#54453D] truncate">{formatDateDisplay(parsedDate)}</span>
          ) : (
            <span className="text-[#A39890]">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ms-2 shrink-0 text-[#75645B]">
          {clearable && parsedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              aria-label="مسح التاريخ"
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

      {/* Calendar Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="التقويم"
          className="absolute top-full start-0 z-50 mt-1.5 w-72 rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(84,69,61,0.08),0_1px_4px_rgba(84,69,61,0.04)] animate-dropdown transition-all origin-top"
        >
          {/* Month / Year Header Nav */}
          <div className="flex items-center justify-between mb-3 text-sm font-bold text-[#54453D]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-[#FAF9F8] text-[#75645B] hover:text-[#54453D] transition-colors"
              aria-label="الشهر السابق"
            >
              <svg className="w-4 h-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span>
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-[#FAF9F8] text-[#75645B] hover:text-[#54453D] transition-colors"
              aria-label="الشهر القادم"
            >
              <svg className="w-4 h-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#A39890] mb-1">
            {weekdayNames.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for month start offset */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <span key={`empty-${idx}`} />
            ))}

            {/* Day buttons */}
            {days.map((day) => {
              const selected = isSelectedDay(day);
              const today = isToday(day);
              const dayDisabled = isDayDisabled(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={dayDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-colors',
                    selected
                      ? 'bg-[#54453D] text-white font-bold'
                      : today
                        ? 'bg-[#F0C5AE] text-[#54453D] font-bold'
                        : 'text-[#54453D] hover:bg-white',
                    dayDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action (اليوم) */}
          <div className="mt-3 pt-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="font-bold text-[#54453D] hover:text-[#C78360] transition-colors p-1"
            >
              {lang === 'ar' ? 'اليوم' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#75645B] hover:text-[#54453D] transition-colors p-1"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

