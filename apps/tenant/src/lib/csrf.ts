import type { NextRequest } from 'next/server';

export interface CsrfValidationResult {
  valid: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Validates CSRF defense-in-depth on state-changing requests:
 * 1. Strict Origin / Referer matching against the request's authoritative Host.
 * 2. Custom header presence ('X-RASHX-CSRF: 1').
 * 3. Optional Content-Type validation.
 */
export function validateCsrf(
  request: NextRequest,
  options?: { requireJson?: boolean }
): CsrfValidationResult {
  const host = request.headers.get('host') || request.nextUrl.host;
  if (!host) {
    return { valid: false, statusCode: 400, error: 'Missing Host header.' };
  }

  // 1. Custom Header Check
  const csrfHeader = request.headers.get('x-rashx-csrf');
  if (csrfHeader !== '1') {
    return {
      valid: false,
      statusCode: 403,
      error: 'طلب غير مصرح به: فشل التحقق من أمان الجلسة (رمز الأمان مفقود).',
    };
  }

  // 2. Strict Origin / Referer Verification
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host.toLowerCase() !== host.toLowerCase()) {
        return {
          valid: false,
          statusCode: 403,
          error: `طلب غير مصرح به: مصدر الطلب (${originUrl.host}) لا يتطابق مع المضيف المعتمد (${host}).`,
        };
      }
    } catch {
      return {
        valid: false,
        statusCode: 400,
        error: 'صيغة ترويسة المصدر (Origin) غير صالحة.',
      };
    }
  } else {
    // Fallback to Referer if Origin is omitted by browser
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host.toLowerCase() !== host.toLowerCase()) {
          return {
            valid: false,
            statusCode: 403,
            error: `طلب غير مصرح به: مصدر الإحالة (${refererUrl.host}) لا يتطابق مع المضيف المعتمد (${host}).`,
          };
        }
      } catch {
        return {
          valid: false,
          statusCode: 400,
          error: 'صيغة ترويسة الإحالة (Referer) غير صالحة.',
        };
      }
    } else {
      // In strict state-changing requests, missing both Origin and Referer is rejected
      return {
        valid: false,
        statusCode: 403,
        error: 'طلب غير مصرح به: ترويسات التحقق من المصدر مفقودة.',
      };
    }
  }

  // 3. Content-Type check if required
  if (options?.requireJson) {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return {
        valid: false,
        statusCode: 415,
        error: 'نوع البيانات غير مدعوم. يلزم إرسال application/json.',
      };
    }
  }

  return { valid: true };
}

