/**
 * RASHX Session Cookie Policy & Configuration
 *
 * In production:
 * - Uses the '__Host-' prefix (__Host-rashx_session).
 * - Requires Secure: true (enforced by browsers per RFC 6265bis).
 * - Requires Path: '/'.
 * - Must NOT set Domain attribute (host-specific, non-delegated).
 * - SameSite: 'lax' for CSRF defense-in-depth while supporting external link navigation.
 * - HttpOnly: true to prevent XSS exfiltration.
 *
 * In local development (HTTP):
 * - Uses 'rashx_session' without the '__Host-' prefix so browsers do not reject it over HTTP.
 * - In production, '__Host-' is ALWAYS used and NEVER weakened.
 */

export interface SessionCookieOptions {
  name: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    path: string;
    maxAge: number;
    domain?: undefined;
  };
}

export const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
export const SESSION_DURATION_SECONDS = Math.floor(SESSION_DURATION_MS / 1000); // 432,000s

export const PROD_COOKIE_NAME = '__Host-rashx_session' as const;
export const DEV_COOKIE_NAME = 'rashx_session' as const;

export function getSessionCookieConfig(): SessionCookieOptions {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    name: isProd ? PROD_COOKIE_NAME : DEV_COOKIE_NAME,
    options: {
      httpOnly: true,
      secure: isProd, // In production, strictly true. Never set false for __Host-!
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
      // Strictly undefined domain attribute for __Host- compliance
    },
  };
}

export function extractSessionCookie(cookies: {
  get: (name: string) => { value: string } | undefined;
}): string | undefined {
  const primaryName = getSessionCookieConfig().name;
  const primaryCookie = cookies.get(primaryName)?.value;
  if (primaryCookie) return primaryCookie;

  // In non-production or migration environments, check the alternative cookie name
  if (process.env.NODE_ENV !== 'production') {
    return (
      cookies.get(PROD_COOKIE_NAME)?.value ||
      cookies.get(DEV_COOKIE_NAME)?.value
    );
  }

  return undefined;
}

