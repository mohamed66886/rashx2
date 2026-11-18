/**
 * RASHX Middleware
 *
 * Responsibilities:
 * 1. Detect language from ?lang query parameter
 * 2. Persist language preference in cookie
 * 3. Pass language to RSC via x-rashx-lang header
 * 4. Default to Arabic (ar) per ADR 0003
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
  const { searchParams } = request.nextUrl;
  const langParam = searchParams.get(LANG_PARAM);

  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Determine active language (priority: query param > cookie > default)
  let lang = DEFAULT_LANG;

  if (langParam !== null && isValidLang(langParam)) {
    lang = langParam;
    // Persist language preference
    response.cookies.set(LANG_COOKIE, lang, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Client-readable for language switcher
    });
  } else {
    const cookieLang = request.cookies.get(LANG_COOKIE)?.value;
    if (cookieLang !== undefined && isValidLang(cookieLang)) {
      lang = cookieLang;
    }
  }

  // Pass language to RSC via header
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
     * - Public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|icons|images|fonts|brand).*)',
  ],
};
