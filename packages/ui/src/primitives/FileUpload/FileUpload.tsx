'use client';

/**
 * RASHX FileUpload Primitive
 *
 * Versatile, accessible file upload supporting:
 * 1. Dropzone: Large drag & drop area with icon, primary text, helper hints, and file cards.
 * 2. Compact: Single-line input bar with browse button and file name display.
 * 3. Avatar: Circular / rounded-2xl image uploader for salon logos and staff photos.
 * 4. Button: Clean trigger button with file chips list.
 *
 * Visual Architecture: Soft shadows, clean white surfaces, zero heavy borders.
 */

import {
  forwardRef,
  useState,
  useRef,
  useId,
  useEffect,
  type ReactNode,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';

export interface FileUploadProps {
  /** Visual variant of upload control */
  variant?: 'dropzone' | 'compact' | 'avatar' | 'button';
  /** Accepted file MIME types or extensions (e.g. "image/*", ".pdf,.docx") */
  accept?: string;
  /** Allow multiple files selection */
  multiple?: boolean;
  /** Max file size in Megabytes (default: 10MB) */
  maxSizeMB?: number;
  /** Max number of files allowed (when multiple=true) */
  maxFiles?: number;
  /** Selected files (controlled) */
  value?: File[];
  /** Default files (uncontrolled) */
  defaultValue?: File[];
  /** Callback fired when files change */
  onChange?: (files: File[]) => void;
  /** Callback fired on error (e.g. size exceeded, invalid type) */
  onError?: (error: string) => void;
  /** Error state */
  hasError?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Language (ar | en) */
  lang?: 'ar' | 'en';
  /** Custom label */
  label?: ReactNode;
  /** Custom description / helper text */
  helperText?: ReactNode;
  /** Size for avatar variant ('sm' | 'md' | 'lg') */
  avatarSize?: 'sm' | 'md' | 'lg';
  /** Existing preview image URL (useful for avatar variant) */
  previewUrl?: string;
  /** ID for accessibility */
  id?: string;
  /** Additional CSS classes */
  className?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      variant = 'dropzone',
      accept,
      multiple = false,
      maxSizeMB = 10,
      maxFiles = 5,
      value: controlledFiles,
      defaultValue = [],
      onChange,
      onError,
      hasError = false,
      errorMessage,
      disabled = false,
      lang = 'ar',
      label,
      helperText,
      avatarSize = 'md',
      previewUrl,
      id,
      className,
    },
    ref,
  ) => {
    const isAr = lang === 'ar';
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const internalInputRef = useRef<HTMLInputElement>(null);
    const resolvedInputRef = (ref as typeof internalInputRef) ?? internalInputRef;

    const isControlled = controlledFiles !== undefined;
    const [internalFiles, setInternalFiles] = useState<File[]>(defaultValue);
    const files = isControlled ? controlledFiles : internalFiles;

    const [isDragging, setIsDragging] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(previewUrl ?? null);

    // Sync previewUrl prop if it changes
    useEffect(() => {
      if (previewUrl) {
        setAvatarPreview(previewUrl);
      }
    }, [previewUrl]);

    // Generate local preview for avatar variant when a file is selected
    useEffect(() => {
      if (variant === 'avatar' && files.length > 0 && files[0]?.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(files[0]);
        setAvatarPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    }, [files, variant]);

    const activeError = errorMessage ?? internalError;

    const validateAndProcessFiles = (newFiles: File[]) => {
      setInternalError(null);
      const validFiles: File[] = [];

      for (const file of newFiles) {
        // Size validation
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
          const err = isAr
            ? `الملف "${file.name}" يتجاوز الحد الأقصى (${maxSizeMB} ميجابايت)`
            : `File "${file.name}" exceeds max size of ${maxSizeMB}MB`;
          setInternalError(err);
          onError?.(err);
          return;
        }

        // Accept validation (basic MIME type check)
        if (accept) {
          const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
          const fileType = file.type.toLowerCase();
          const fileName = file.name.toLowerCase();

          const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith('.')) {
              return fileName.endsWith(type);
            }
            if (type.endsWith('/*')) {
              const prefix = type.slice(0, -2);
              return fileType.startsWith(prefix);
            }
            return fileType === type;
          });

          if (!isAccepted) {
            const err = isAr
              ? `الملف "${file.name}" نوعه غير مدعوم (${accept})`
              : `File "${file.name}" has unsupported type (${accept})`;
            setInternalError(err);
            onError?.(err);
            return;
          }
        }

        validFiles.push(file);
      }

      // Max files check
      let updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      if (multiple && updatedFiles.length > maxFiles) {
        updatedFiles = updatedFiles.slice(0, maxFiles);
        const err = isAr
          ? `الحد الأقصى للملفات المسموح بها هو ${maxFiles} ملفات`
          : `Maximum allowed files is ${maxFiles}`;
        setInternalError(err);
        onError?.(err);
      }

      if (!isControlled) {
        setInternalFiles(updatedFiles);
      }
      onChange?.(updatedFiles);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files ? Array.from(e.target.files) : [];
      if (selected.length > 0) {
        validateAndProcessFiles(selected);
      }
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    };

    const handleRemoveFile = (index: number) => {
      const updated = files.filter((_, i) => i !== index);
      if (!isControlled) {
        setInternalFiles(updated);
      }
      onChange?.(updated);
      if (variant === 'avatar' && updated.length === 0) {
        setAvatarPreview(previewUrl ?? null);
      }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;

      const dropped = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
      if (dropped.length > 0) {
        validateAndProcessFiles(dropped);
      }
    };

    const triggerBrowse = () => {
      if (!disabled && resolvedInputRef.current) {
        resolvedInputRef.current.click();
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        triggerBrowse();
      }
    };

    // ── Variant: Avatar / Profile Image ─────────────────────────
    if (variant === 'avatar') {
      const dimensions = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
      }[avatarSize];

      return (
        <div className={cn('inline-flex flex-col items-center gap-2 font-sans select-none', className)}>
          <input
            ref={resolvedInputRef}
            id={inputId}
            type="file"
            accept={accept ?? 'image/*'}
            disabled={disabled}
            onChange={handleInputChange}
            className="sr-only"
            tabIndex={-1}
          />

          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={triggerBrowse}
            onKeyDown={handleKeyDown}
            aria-label={label ? String(label) : isAr ? 'رفع صورة' : 'Upload photo'}
            className={cn(
              'group relative rounded-2xl overflow-hidden bg-white cursor-pointer transition-all duration-200 outline-none',
              'focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2',
              (hasError || Boolean(activeError)) && 'ring-2 ring-[#DC2626]',
              disabled && 'opacity-60 cursor-not-allowed',
              dimensions,
            )}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={isAr ? 'صورة المعاينة' : 'Avatar Preview'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF9F8] text-[#75645B]">
                <svg className="w-8 h-8 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}

            {/* Hover overlay badge */}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 text-white">
              <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-[10px] font-semibold">
                {isAr ? 'تغيير' : 'Change'}
              </span>
            </div>
          </div>

          {label && (
            <span className="text-xs font-semibold text-[#54453D] text-center">
              {label}
            </span>
          )}
          {helperText && (
            <span className="text-[11px] text-[#75645B] text-center">
              {helperText}
            </span>
          )}
          {activeError && (
            <span className="text-xs font-medium text-[#DC2626] text-center" role="alert">
              {activeError}
            </span>
          )}
        </div>
      );
    }

    // ── Variant: Compact Input Bar ──────────────────────────────
    if (variant === 'compact') {
      const hasFiles = files.length > 0;
      return (
        <div className={cn('w-full font-sans select-none space-y-1.5', className)}>
          <input
            ref={resolvedInputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleInputChange}
            className="sr-only"
            tabIndex={-1}
          />

          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={triggerBrowse}
            onKeyDown={handleKeyDown}
            className={cn(
              'group flex items-center justify-between w-full h-11 px-3 bg-white rounded-xl cursor-pointer transition-all duration-150 outline-none',
              'focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2',
              (hasError || Boolean(activeError)) && 'ring-2 ring-[#DC2626]',
              disabled && 'opacity-60 cursor-not-allowed',
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden text-start">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF9F8] group-hover:bg-[#F2EFEB] text-xs font-semibold text-[#54453D] transition-colors shrink-0">
                <svg className="w-3.5 h-3.5 text-[#75645B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>{isAr ? 'اختيار ملف' : 'Browse'}</span>
              </span>

              {hasFiles ? (
                <span className="text-xs font-medium text-[#54453D] truncate">
                  {multiple
                    ? isAr
                      ? `${files.length} ملفات محددة`
                      : `${files.length} files selected`
                    : files[0]?.name}
                </span>
              ) : (
                <span className="text-xs text-[#A39890] truncate">
                  {helperText ?? (isAr ? 'لم يتم اختيار أي ملف بعد' : 'No file chosen')}
                </span>
              )}
            </div>

            {hasFiles && !disabled && (
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(0);
                }}
                aria-label={isAr ? 'إلغاء الملف' : 'Clear file'}
                className="p-1 rounded-md text-[#75645B] hover:text-[#991B1B] hover:bg-[#F2EFEB] transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {activeError && (
            <span className="text-xs font-medium text-[#DC2626] block" role="alert">
              {activeError}
            </span>
          )}
        </div>
      );
    }

    // ── Variant: Button Trigger ─────────────────────────────────
    if (variant === 'button') {
      return (
        <div className={cn('w-full font-sans select-none space-y-2', className)}>
          <input
            ref={resolvedInputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleInputChange}
            className="sr-only"
            tabIndex={-1}
          />

          <button
            type="button"
            disabled={disabled}
            onClick={triggerBrowse}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-xs font-semibold text-[#54453D] transition-all duration-150 outline-none',
              'focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2',
              disabled && 'opacity-60 cursor-not-allowed',
            )}
          >
            <svg className="w-4 h-4 text-[#75645B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{label ?? (isAr ? 'رفع ملفات أو مستندات' : 'Upload Files')}</span>
          </button>

          {/* Selected File Chips */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white text-xs text-[#54453D]"
                >
                  <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                  <span className="text-[10px] text-[#A39890]">{formatFileSize(file.size)}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-[#75645B] hover:text-[#991B1B] font-bold text-xs"
                      aria-label={isAr ? 'إزالة' : 'Remove'}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeError && (
            <span className="text-xs font-medium text-[#DC2626] block" role="alert">
              {activeError}
            </span>
          )}
        </div>
      );
    }

    // ── Variant: Dropzone (Default) ─────────────────────────────
    return (
      <div className={cn('w-full font-sans select-none space-y-3', className)}>
        <input
          ref={resolvedInputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
        />

        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={triggerBrowse}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label={label ? String(label) : isAr ? 'منطقة رفع الملفات' : 'File dropzone'}
          className={cn(
            'group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-white text-center cursor-pointer transition-all duration-200 outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2',
            isDragging && 'bg-[#F0C5AE]/15 ring-2 ring-[#F0C5AE] scale-[1.01]',
            (hasError || Boolean(activeError)) && 'ring-2 ring-[#DC2626]',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
        >
          {/* Cloud Upload Icon Badge */}
          <div className="w-13 h-13 mb-3.5 rounded-full bg-[#FAF9F8] group-hover:bg-[#F0C5AE]/20 group-hover:scale-105 flex items-center justify-center text-[#54453D] transition-all duration-200">
            <svg
              className="w-6 h-6 text-[#54453D] transition-transform duration-200 group-hover:-translate-y-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="M12 12v9" />
              <path d="m16 16-4-4-4 4" />
            </svg>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-[#54453D]">
              {label ?? (isAr ? 'اسحب الملفات هنا أو اضغط للاختيار' : 'Drag & drop files here, or browse')}
            </p>
            <p className="text-xs text-[#75645B]">
              {helperText ??
                (isAr
                  ? `يدعم الصور والمستندات بحد أقصى ${maxSizeMB} ميجابايت`
                  : `Supports images & documents up to ${maxSizeMB}MB`)}
            </p>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF9F8] group-hover:bg-[#54453D] text-xs font-semibold text-[#54453D] group-hover:text-white transition-colors duration-150">
              {isAr ? 'تصفح جهازك' : 'Browse Files'}
            </span>
          </div>
        </div>

        {/* Selected Files List Cards */}
        {files.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#54453D] block">
              {isAr ? `الملفات المرفوعة (${files.length})` : `Uploaded Files (${files.length})`}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file, idx) => {
                const isImage = file.type.startsWith('image/');
                return (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white text-start animate-dropdown"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF9F8] flex items-center justify-center shrink-0 text-[#75645B]">
                        {isImage ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-[#54453D] truncate">{file.name}</p>
                        <p className="text-[10px] text-[#A39890]">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        aria-label={isAr ? `إزالة ${file.name}` : `Remove ${file.name}`}
                        className="p-1 rounded-md text-[#75645B] hover:text-[#991B1B] hover:bg-[#FAF9F8] transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeError && (
          <span className="text-xs font-medium text-[#DC2626] block" role="alert">
            {activeError}
          </span>
        )}
      </div>
    );
  },
);

FileUpload.displayName = 'FileUpload';

