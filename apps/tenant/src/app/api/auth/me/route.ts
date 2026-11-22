import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTenantSession } from '@/lib/tenant-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getTenantSession();

  if (!session) {
    return NextResponse.json(
      { authenticated: false, error: 'غير مسجل أو انتهت صلاحية الجلسة' },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: session.user,
      tenant: {
        id: session.tenant.tenantId,
        slug: session.tenant.slug,
        name: session.tenant.name,
      },
      membership: session.membership,
    },
    { status: 200 }
  );
}

