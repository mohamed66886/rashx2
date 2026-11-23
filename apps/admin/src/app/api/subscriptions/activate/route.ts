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

    const { tenantId, durationDays, planId, note } = body;
    let adminUid = body.adminUid;

    // Check Authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = await verifyIdToken(authHeader.slice(7).trim(), true);
        adminUid = decoded.uid;
      } catch (authErr) {
        return NextResponse.json({ error: 'رمز التحقق منتهي أو غير صالح' }, { status: 401 });
      }
    }

    if (!tenantId || typeof tenantId !== 'string') {
      return NextResponse.json({ error: 'معرّف الصالون (tenantId) مطلوب' }, { status: 400 });
    }

    if (!adminUid || typeof adminUid !== 'string') {
      return NextResponse.json({ error: 'معرّف مسؤول المنصة (adminUid) مطلوب للتحقق الأمني' }, { status: 401 });
    }

    const duration = parseInt(String(durationDays), 10);
    if (isNaN(duration) || duration < 1) {
      return NextResponse.json({ error: 'مدة التفعيل بالأيام يجب أن تكون 1 أو أكثر' }, { status: 400 });
    }

    const db = getFirebaseAdminFirestore();
    const subRepo = new SubscriptionRepository(db);

    const updated = await subRepo.activateSubscription({
      tenantId,
      adminUid,
      durationDays: duration,
      planId: planId || 'STARTER',
      note: note || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'تم تفعيل اشتراك الصالون بنجاح وتسجيل عملية التدقيق',
        subscription: updated,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[API /api/subscriptions/activate POST] Error:', err);

    if (err instanceof SubscriptionUnauthorizedError) {
      return NextResponse.json(
        { error: 'غير مصرح: هذا الإجراء مقيد بمسؤولي منصة راش إكس المعتمدين فقط' },
        { status: 403 }
      );
    }

    if (err instanceof SubscriptionError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }

    return NextResponse.json(
      { error: err?.message || 'حدث خطأ أثناء تفعيل الاشتراك' },
      { status: 500 }
    );
  }
}
