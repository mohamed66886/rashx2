import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifyIdToken,
  createSessionCookie,
  getAuthoritativeTenant,
} from '@/lib/tenant-auth';
import { MembershipRepository, getFirebaseAdminFirestore, firestorePaths } from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. CSRF Protection
  const csrfHeader = request.headers.get('x-rashx-csrf');
  if (csrfHeader !== '1') {
    return NextResponse.json(
      { error: 'طلب غير مصرح به: فشل التحقق من أمان الجلسة (CSRF)' },
      { status: 403 }
    );
  }

  // 2. Resolve Authoritative Tenant Context for current host
  const tenant = await getAuthoritativeTenant(false);
  if (!tenant) {
    return NextResponse.json(
      { error: 'تعذر تحديد الصالون المطلوب أو أن الحساب معطل' },
      { status: 404 }
    );
  }

  // 3. Parse and Validate Request Payload
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'صيغة البيانات غير صحيحة' },
      { status: 400 }
    );
  }

  const idToken = body?.idToken;
  if (!idToken || typeof idToken !== 'string') {
    return NextResponse.json(
      { error: 'رمز الدخول (idToken) مطلوب' },
      { status: 400 }
    );
  }

  // 4. Verify ID Token
  let verifiedUser;
  try {
    verifiedUser = await verifyIdToken(idToken, true);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'رمز الدخول غير صالح أو منتهي الصلاحية' },
      { status: 401 }
    );
  }

  const uid = verifiedUser.uid;
  const db = getFirebaseAdminFirestore();

  // 5. Authoritatively Verify Tenant Membership
  const membershipRepo = new MembershipRepository(db);
  const membership = await membershipRepo.getMembership(tenant.tenantId, uid);

  let userRole = membership?.role;

  if (!membership || membership.status !== 'ACTIVE') {
    // Check if platform admin
    const adminSnap = await db.doc(firestorePaths.platformAdmin(uid)).get();
    if (adminSnap.exists && adminSnap.data()?.isActive === true) {
      userRole = 'OWNER'; // platform admins have elevated owner-level access
    } else {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية وصول إلى هذا الصالون. يرجى التواصل مع إدارة الصالون.' },
        { status: 403 }
      );
    }
  }

  // 6. Create Firebase Admin Session Cookie
  let sessionCookie: string;
  try {
    sessionCookie = await createSessionCookie(idToken, SESSION_DURATION_MS);
  } catch (cookieErr: any) {
    return NextResponse.json(
      { error: 'فشل إنشاء جلسة الدخول الآمنة' },
      { status: 500 }
    );
  }

  // 7. Issue Response with Host-Specific __Host- Cookie
  const response = NextResponse.json(
    {
      status: 'success',
      tenantId: tenant.tenantId,
      slug: tenant.slug,
      role: userRole,
    },
    { status: 200 }
  );

  response.cookies.set({
    name: '__Host-rashx_session',
    value: sessionCookie,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });

  return response;
}

