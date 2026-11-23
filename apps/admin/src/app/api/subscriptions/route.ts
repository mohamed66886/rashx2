import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getFirebaseAdminFirestore,
  SubscriptionRepository,
  type SubscriptionStatus,
} from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as SubscriptionStatus | null;
    const search = searchParams.get('search') || undefined;

    const db = getFirebaseAdminFirestore();
    const subRepo = new SubscriptionRepository(db);

    const data = await subRepo.listSubscriptionsWithTenants({
      status: status || undefined,
      search,
    });

    return NextResponse.json({ success: true, salons: data }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/subscriptions GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to list salon subscriptions' },
      { status: 500 }
    );
  }
}
