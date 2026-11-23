import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getFirebaseAdminFirestore,
  SubscriptionRepository,
  SubscriptionUnauthorizedError,
  SubscriptionError,
  verifyIdToken,
} from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'صيغة البيانات غير صالحة' }, { status: 400 });
    }

    const { tenantId, reason } = body;
    let adminUid = body.adminUid;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = await verifyIdToken(authHeader.slice(7).trim(), true);
        adminUid = decoded.uid;
      } catch {
        return NextResponse.json({ error: 'رمز التحقق غير صالح' }, { status: 401 });
      }
    }

    if (!tenantId || !adminUid || !reason) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة: tenantId, adminUid, reason' },
        { status: 400 }
      );
    }

    const db = getFirebaseAdminFirestore();
    const subRepo = new SubscriptionRepository(db);

    const updated = await subRepo.suspendSubscription({
      tenantId,
      adminUid,
      reason,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'تم تعليق اشتراك الصالون وتسجيل سبب التعليق في سجل التدقيق',
        subscription: updated,
      },
      { status: 200 }
    );
  } catch (err: any) {
    if (err instanceof SubscriptionUnauthorizedError) {
      return NextResponse.json(
        { error: 'غير مصرح: هذا الإجراء مقيد بمسؤولي منصة راش إكس المعتمدين فقط' },
        { status: 403 }
      );
    }
    if (err instanceof SubscriptionError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    return NextResponse.json({ error: err?.message || 'خطأ أثناء التعليق' }, { status: 500 });
  }
}
