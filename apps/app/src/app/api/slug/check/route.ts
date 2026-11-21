import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SlugFormatSchema } from '@rashx/database';
import { TenantRepository } from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get('slug')?.trim().toLowerCase() || '';

  if (!rawSlug) {
    return NextResponse.json(
      { available: false, valid: false, reason: 'الرجاء إدخال اسم النطاق الفرعي' },
      { status: 400 }
    );
  }

  const formatResult = SlugFormatSchema.safeParse(rawSlug);
  if (!formatResult.success) {
    return NextResponse.json(
      {
        available: false,
        valid: false,
        reason: 'يجب أن يتكون النطاق من 3 إلى 63 حرفاً باللغة الإنجليزية وأرقام وعلامة (-) فقط، دون أن يبدأ أو ينتهي بعلامة (-)',
      },
      { status: 200 }
    );
  }

  const slug = formatResult.data;

  try {
    const tenantRepo = new TenantRepository();
    const available = await tenantRepo.isSlugAvailable(slug);

    return NextResponse.json(
      {
        available,
        valid: true,
        slug,
        reason: available ? 'النطاق متاح للتسجيل' : 'هذا النطاق محجوز مسبقاً',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        available: false,
        valid: true,
        slug,
        reason: 'تعذر التحقق من توفر النطاق حالياً. الرجاء المحاولة لاحقاً.',
      },
      { status: 500 }
    );
  }
}

