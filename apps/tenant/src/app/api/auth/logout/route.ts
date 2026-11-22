import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie, revokeRefreshTokens } from '@/lib/tenant-auth';
import { validateCsrf } from '@/lib/csrf';
import {
  getSessionCookieConfig,
  extractSessionCookie,
  PROD_COOKIE_NAME,
  DEV_COOKIE_NAME,
} from '@/lib/session-cookie';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Strict CSRF & Origin Verification
  const csrfResult = validateCsrf(request);
  if (!csrfResult.valid) {
    return NextResponse.json(
      { error: csrfResult.error },
      { status: csrfResult.statusCode || 403 }
    );
  }

  // 2. Check Logout Policy: Ordinary (Local Browser) vs Global Revocation
  const sessionCookie = extractSessionCookie(request.cookies);
  let isGlobalRevocation = request.nextUrl.searchParams.get('global') === 'true';

  // Check JSON body if provided
  if (!isGlobalRevocation) {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await request.json();
        if (body?.global === true) {
          isGlobalRevocation = true;
        }
      }
    } catch {
      // Body parsing optional on logout
    }
  }

  let revokedUid: string | null = null;
  if (isGlobalRevocation && sessionCookie) {
    try {
      // Decode user identity from session cookie to revoke all refresh tokens
      const user = await verifySessionCookie(sessionCookie, false);
      if (user?.uid) {
        await revokeRefreshTokens(user.uid);
        revokedUid = user.uid;
      }
    } catch {
      // Ignore token decode failures during logout
    }
  }

  // 3. Construct Clean Response
  const response = NextResponse.json(
    {
      status: 'success',
      mode: isGlobalRevocation ? 'global' : 'local',
      globalRevoked: Boolean(revokedUid),
    },
    { status: 200 }
  );

  // 4. Clear Session Cookie for current host
  const cookieConfig = getSessionCookieConfig();
  response.cookies.set({
    name: cookieConfig.name,
    value: '',
    httpOnly: true,
    secure: cookieConfig.options.secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // In non-production, ensure both development and production cookie names are cleared
  if (process.env.NODE_ENV !== 'production') {
    response.cookies.set({
      name: PROD_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    response.cookies.set({
      name: DEV_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  return response;
}
