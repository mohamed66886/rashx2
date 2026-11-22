import type { NextRequest } from 'next/server';

export interface CsrfValidationResult {
  valid: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Validates CSRF defense-in-depth on state-changing requests in apps/app:
 * 1. Origin / Referer validation against the request's authoritative Host.
 * 2. Custom header presence ('X-RASHX-CSRF: 1').
 */
export function validateCsrf(request: NextRequest): CsrfValidationResult {
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
      return {
        valid: false,
        statusCode: 403,
        error: 'طلب غير مصرح به: ترويسات التحقق من المصدر مفقودة.',
      };
    }
  }

  return { valid: true };
}

