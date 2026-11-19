'use client';

/**
 * RASHX Select / Dropdown Primitive
 *
 * Custom accessible dropdown selection component with search filter and multi-select support.
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  useState,
  useRef,
  useEffect,
  useId,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T | T[];
  onChange?: (value: T) => void;
  onMultiChange?: (values: T[]) => void;
  multiple?: boolean;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
  'aria-label'?: string;
}

export function Select<T = string>({
  options,
  value,
  onChange,
  onMultiChange,
  multiple = false,
  placeholder = 'اختر من القائمة...',
  searchable = false,
  searchPlaceholder = 'ابحث...',
  clearable = false,
  disabled = false,
  hasError = false,
  size = 'md',
  id,
  className,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen, searchable]);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isSelected = (optValue: T) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optValue);
    }
    return value === optValue;
  };

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? [...value] : [];
      const existsIndex = currentValues.indexOf(option.value);
      if (existsIndex > -1) {
        currentValues.splice(existsIndex, 1);
      } else {
        currentValues.push(option.value);
      }
      onMultiChange?.(currentValues);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onMultiChange?.([]);
    } else {
      onChange?.(undefined as unknown as T);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]!);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Label rendering
  const selectedOptions = options.filter((opt) => isSelected(opt.value));
  const hasSelection = selectedOptions.length > 0;

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
        id={selectId}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        aria-invalid={hasError ? 'true' : undefined}
        className={cn(
          'flex items-center justify-between w-full bg-white text-[#54453D] transition-all duration-150',
          'hover:bg-white focus-visible:bg-white focus-visible:outline-none',
          hasError && 'bg-[#FEF2F2]',
          disabled && 'bg-[#F2EFEB] text-[#A39890] opacity-60 cursor-not-allowed',
          sizeClasses,
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden text-start">
          {hasSelection ? (
            multiple ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedOptions.map((opt) => (
                  <span
                    key={String(opt.value)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#F0C5AE] px-2 py-0.5 text-xs font-semibold text-[#54453D]"
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label="إزالة"
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentValues = Array.isArray(value) ? value : [];
                        onMultiChange?.(currentValues.filter((v) => v !== opt.value));
                      }}
                      className="ms-0.5 text-[#54453D] hover:text-[#991B1B] font-bold text-xs cursor-pointer select-none"
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="flex items-center gap-2 font-medium truncate">
                {selectedOptions[0]?.icon}
                <span>{selectedOptions[0]?.label}</span>
              </span>
            )
          ) : (
            <span className="text-[#A39890]">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ms-2 shrink-0 text-[#75645B]">
          {clearable && hasSelection && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              aria-label="مسح الاختيار"
              className="p-1 rounded-md hover:bg-[#E6E1DC] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          )}

          <svg
            className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable={multiple}
          className="absolute top-full start-0 z-50 mt-1.5 w-full rounded-xl bg-white p-1.5 shadow-[0_4px_20px_rgba(84,69,61,0.08),0_1px_4px_rgba(84,69,61,0.04)] animate-dropdown transition-all origin-top"
        >
          {searchable && (
            <div className="p-1 mb-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8 px-2.5 rounded-lg bg-[#FAF9F8] text-xs text-[#54453D] placeholder:text-[#A39890] outline-none focus:ring-1 focus:ring-[#54453D]"
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#A39890]">لا توجد نتائج مطابقة</div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const selected = isSelected(opt.value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors',
                      selected
                        ? 'bg-[#F0C5AE]/40 font-bold text-[#54453D]'
                        : isHighlighted
                          ? 'bg-[#FAF9F8] text-[#54453D]'
                          : 'text-[#54453D] hover:bg-[#FAF9F8]',
                      opt.disabled && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <div>
                        <p>{opt.label}</p>
                        {opt.description && (
                          <p className="text-[10px] text-[#75645B] mt-0.5">{opt.description}</p>
                        )}
                      </div>
                    </div>

                    {selected && (
                      <svg className="w-4 h-4 text-[#54453D] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

