'use client';

/**
 * RASHX PhoneInput Primitive
 *
 * Dedicated mobile & phone number input with localized GCC & international country dial codes.
 * Default: Saudi Arabia (+966)
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  type InputHTMLAttributes,
  type ChangeEvent,
} from 'react';
import { cn } from '../../lib/cn';

export interface CountryCode {
  code: string;
  dialCode: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  placeholder: string;
}

export const DEFAULT_COUNTRIES: CountryCode[] = [
  { code: 'SA', dialCode: '+966', nameAr: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: 'AE', dialCode: '+971', nameAr: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'KW', dialCode: '+965', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼', placeholder: '50 123 456' },
  { code: 'QA', dialCode: '+974', nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦', placeholder: '50 123 456' },
  { code: 'BH', dialCode: '+973', nameAr: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭', placeholder: '36 123 456' },
  { code: 'OM', dialCode: '+968', nameAr: 'عُمان', nameEn: 'Oman', flag: '🇴🇲', placeholder: '91 123 456' },
  { code: 'EG', dialCode: '+20', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', placeholder: '10 1234 5678' },
  { code: 'JO', dialCode: '+962', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', placeholder: '7 9123 4567' },
  { code: 'GB', dialCode: '+44', nameAr: 'المملكة المتحدة', nameEn: 'UK', flag: '🇬🇧', placeholder: '7123 456789' },
  { code: 'US', dialCode: '+1', nameAr: 'الولايات المتحدة', nameEn: 'USA', flag: '🇺🇸', placeholder: '202 555 0123' },
];

export interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** Active country dial code */
  country?: CountryCode;
  /** Available countries list */
  countries?: CountryCode[];
  /** Callback fired when country changes */
  onCountryChange?: (country: CountryCode) => void;
  /** Callback fired when phone number value changes */
  onChange?: (value: string, country: CountryCode) => void;
  /** Language for country labels */
  lang?: 'ar' | 'en';
  /** Error state */
  hasError?: boolean;
  /** Input size */
  inputSize?: 'sm' | 'md' | 'lg';
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      country = DEFAULT_COUNTRIES[0]!,
      countries = DEFAULT_COUNTRIES,
      onCountryChange,
      onChange,
      lang = 'ar',
      hasError = false,
      inputSize = 'md',
      value = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(country);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync selected country if prop changes
    useEffect(() => {
      setSelectedCountry(country);
    }, [country]);

    // Close dropdown on outside click
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    const handleSelectCountry = (c: CountryCode) => {
      setSelectedCountry(c);
      onCountryChange?.(c);
      setIsOpen(false);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9\s]/g, '');
      onChange?.(rawValue, selectedCountry);
    };

    const sizeClasses = {
      sm: 'h-9 text-xs rounded-md',
      md: 'h-11 text-sm rounded-lg',
      lg: 'h-13 text-base rounded-xl',
    }[inputSize];

    return (
      <div
        ref={dropdownRef}
        className={cn(
          'relative flex items-center w-full bg-white transition-all duration-150 outline-none',
          hasError && 'bg-[#FEF2F2]',
          disabled && 'bg-[#F2EFEB] opacity-60 cursor-not-allowed',
          sizeClasses,
          className,
        )}
      >
        {/* Country Code Trigger Button (Tonal Flat Badge) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 m-1 bg-[#FAF9F8] hover:bg-[#F2EFEB] rounded-md select-none text-[#54453D] transition-colors focus:outline-none shrink-0',
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={lang === 'ar' ? 'اختر الدولة' : 'Select Country'}
        >
          <span className="text-base leading-none" role="img" aria-hidden="true">
            {selectedCountry.flag}
          </span>
          <span className="font-semibold text-xs text-[#54453D] dir-ltr">
            {selectedCountry.dialCode}
          </span>
          <svg
            className={cn('w-3.5 h-3.5 text-[#75645B] transition-transform duration-200', isOpen && 'rotate-180')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Mobile Number Input */}
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          dir="ltr"
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          placeholder={selectedCountry.placeholder}
          aria-invalid={hasError ? 'true' : undefined}
          className="flex-1 min-w-0 h-full px-2.5 bg-transparent text-[#54453D] placeholder:text-[#A39890] outline-none font-sans text-start dir-ltr"
          {...props}
        />

        {/* Country Picker Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            className="absolute top-full start-0 z-50 mt-1.5 w-64 max-h-60 overflow-y-auto rounded-xl bg-white p-1.5 shadow-[0_4px_20px_rgba(84,69,61,0.08),0_1px_4px_rgba(84,69,61,0.04)] animate-dropdown transition-all origin-top"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {countries.map((c) => {
              const isSelected = c.code === selectedCountry.code;
              return (
                <div
                  key={c.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectCountry(c)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs select-none transition-colors',
                    isSelected ? 'bg-[#F0C5AE]/40 font-bold text-[#54453D]' : 'hover:bg-[#FAF9F8] text-[#54453D]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-medium">{lang === 'ar' ? c.nameAr : c.nameEn}</span>
                  </div>
                  <span className="font-semibold text-[#75645B] dir-ltr">{c.dialCode}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';
