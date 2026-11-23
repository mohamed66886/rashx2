import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getFirebaseAdminFirestore,
  SubscriptionRepository,
} from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
): Promise<NextResponse> {
  try {
    const { tenantId } = await params;
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId مطلوب' }, { status: 400 });
    }

    const db = getFirebaseAdminFirestore();
    const subRepo = new SubscriptionRepository(db);

    const auditTrail = await subRepo.getSubscriptionAuditTrail(tenantId);
    return NextResponse.json({ success: true, auditTrail }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'تعذر جلب سجل التدقيق' }, { status: 500 });
  }
}

