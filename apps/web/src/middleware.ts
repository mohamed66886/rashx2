/**
 * RASHX Middleware
 *
 * Responsibilities:
 * 1. Detect language from ?lang query parameter
 * 2. Handle legacy or mistaken /ar or /en path prefixes gracefully (redirects to clean / or ?lang=en per ADR 0003)
 * 3. Persist language preference in cookie
 * 4. Pass language to RSC via x-rashx-lang header
 * 5. Default to Arabic (ar) per ADR 0003
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LANG_COOKIE,
  LANG_HEADER,
  LANG_PARAM,
  DEFAULT_LANG,
  isValidLang,
} from '@rashx/i18n/types';

export function middleware(request: NextRequest): NextResponse {
  const { pathname, searchParams } = request.nextUrl;

  // ── Handle /ar or /en path prefixes gracefully (ADR 0003 compliance) ──
  // Per ADR 0003, Arabic lives at / (clean) and English at ?lang=en.
  // If a browser/user requests /ar, redirect to / with Arabic cookie.
  // If a browser/user requests /en, redirect to ?lang=en with English cookie.
  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    const cleanPath = pathname === '/ar' ? '/' : pathname.replace(/^\/ar/, '') || '/';
    const redirectUrl = new URL(cleanPath, request.url);
    searchParams.forEach((val, key) => {
      if (key !== 'lang') redirectUrl.searchParams.set(key, val);
    });

    const response = NextResponse.redirect(redirectUrl, 308);
    response.cookies.set(LANG_COOKIE, 'ar', {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
    return response;
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const cleanPath = pathname === '/en' ? '/' : pathname.replace(/^\/en/, '') || '/';
    const redirectUrl = new URL(cleanPath, request.url);
    searchParams.forEach((val, key) => {
      redirectUrl.searchParams.set(key, val);
    });
    redirectUrl.searchParams.set('lang', 'en');

    const response = NextResponse.redirect(redirectUrl, 308);
    response.cookies.set(LANG_COOKIE, 'en', {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
    return response;
  }

  const langParam = searchParams.get(LANG_PARAM);

  // Determine active language (priority: query param > cookie > default)
  let lang = DEFAULT_LANG;

  if (langParam !== null && isValidLang(langParam)) {
    lang = langParam;
  } else {
    const cookieLang = request.cookies.get(LANG_COOKIE)?.value;
    if (cookieLang !== undefined && isValidLang(cookieLang)) {
      lang = cookieLang;
    }
  }

  // Pass language to RSC via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LANG_HEADER, lang);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Persist language preference whenever explicit query param is supplied
  if (langParam !== null && isValidLang(langParam)) {
    response.cookies.set(LANG_COOKIE, lang, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Client-readable for language switcher
    });
  }

  // Pass language to response header as well (for client / tests inspection)
  response.headers.set(LANG_HEADER, lang);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - Any file with an extension (e.g. .svg, .png, .ico, .otf, etc.)
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};
