import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie, revokeRefreshTokens } from '@/lib/tenant-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionCookie = request.cookies.get('__Host-rashx_session')?.value;

  if (sessionCookie) {
    try {
      const user = await verifySessionCookie(sessionCookie, false);
      if (user?.uid) {
        await revokeRefreshTokens(user.uid);
      }
    } catch {
      // Ignore token decode failures during logout
    }
  }

  const response = NextResponse.json({ status: 'success' }, { status: 200 });

  response.cookies.set({
    name: '__Host-rashx_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

