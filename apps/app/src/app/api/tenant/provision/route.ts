import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  verifyIdToken,
  getFirebaseAdminFirestore,
  getFirebaseAdminStorage,
  firestorePaths,
  TenantRepository,
  TenantProvisioningError,
  TenantProvisioningErrorCode,
} from '@/lib/firebase-server';
import {
  SlugFormatSchema,
  SaudiCrNumberSchema,
  CommercialRegistrationDocSchema,
  TenantProvisioningDocSchema,
  ALLOWED_CERTIFICATE_MIME_TYPES,
  MAX_CERTIFICATE_SIZE_BYTES,
  detectMimeFromBytes,
  type CommercialRegistrationDoc,
  type TenantProvisioningDoc,
} from '@rashx/database';
import { validateCsrf } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. CSRF & Origin Protection
  const csrfResult = validateCsrf(request);
  if (!csrfResult.valid) {
    return NextResponse.json(
      { error: csrfResult.error },
      { status: csrfResult.statusCode || 403 }
    );
  }

  // 2. Authorize Bearer ID Token
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'غير مصرح به: يلزم تسجيل الدخول أو إرسال رمز التحقق' },
      { status: 401 }
    );
  }

  const idToken = authHeader.slice(7).trim();
  let verifiedUser;
  try {
    verifiedUser = await verifyIdToken(idToken, true);
  } catch (authError: any) {
    console.error('[API /api/tenant/provision] Auth verification error:', authError?.message || authError);
    if (authError?.name === 'ConfigurationError') {
      return NextResponse.json(
        { error: 'إعدادات Firebase Admin مفقودة في الخادم. يرجى تهيئة متغيرات البيئة.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'انتهت صلاحية الجلسة أو أن رمز التحقق غير صالح. يرجى إعادة المحاولة.' },
      { status: 401 }
    );
  }

  const uid = verifiedUser.uid;

  // 3. Parse FormData Payload
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json(
      { error: 'صيغة البيانات المرسلة غير صالحة' },
      { status: 400 }
    );
  }

  const name = formData.get('name')?.toString().trim() || '';
  const commercialName = formData.get('commercialName')?.toString().trim() || name;
  const displayName = formData.get('displayName')?.toString().trim() || verifiedUser.displayName || 'مالك المنشأة';
  const email = (formData.get('email')?.toString().trim() || verifiedUser.email || '').toLowerCase();
  const phoneNumber = formData.get('phoneNumber')?.toString().trim() || verifiedUser.phoneNumber || null;
  const rawSlug = formData.get('slug')?.toString().trim().toLowerCase() || '';
  const crNumber = formData.get('crNumber')?.toString().trim() || '';
  const certificateFile = formData.get('certificate') as File | null;

  // 4. Validate Registration Fields
  if (!name || name.length > 100) {
    return NextResponse.json(
      { error: 'اسم المنشأة مطلوب ويجب ألا يتجاوز 100 حرف' },
      { status: 400 }
    );
  }

  const slugResult = SlugFormatSchema.safeParse(rawSlug);
  if (!slugResult.success) {
    return NextResponse.json(
      { error: 'اسم النطاق غير صالح. يجب أن يتكون من 3 إلى 63 حرفاً وأرقام وعلامة (-) فقط' },
      { status: 400 }
    );
  }
  const slug = slugResult.data;

  const crResult = SaudiCrNumberSchema.safeParse(crNumber);
  if (!crResult.success) {
    return NextResponse.json(
      { error: 'رقم السجل التجاري غير صالح. يجب أن يتكون من 10 أرقام دقيقة' },
      { status: 400 }
    );
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'البريد الإلكتروني غير صالح' },
      { status: 400 }
    );
  }

  // 5. Validate Certificate File (MIME, size, magic numbers)
  if (!certificateFile || !(certificateFile instanceof Blob)) {
    return NextResponse.json(
      { error: 'شهادة السجل التجاري مطلوبة (PDF أو JPG أو PNG)' },
      { status: 400 }
    );
  }

  if (certificateFile.size > MAX_CERTIFICATE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'حجم ملف الشهادة يتجاوز الحد الأقصى المسموح به (5 ميجابايت)' },
      { status: 400 }
    );
  }

  const fileArrayBuffer = await certificateFile.arrayBuffer();
  const fileBuffer = Buffer.from(fileArrayBuffer);
  const detectedMime = detectMimeFromBytes(fileBuffer);

  if (!detectedMime || !ALLOWED_CERTIFICATE_MIME_TYPES.has(detectedMime)) {
    return NextResponse.json(
      { error: 'نوع الملف غير مدعوم أو غير متطابق. الأنواع المدعومة: PDF أو JPG أو PNG فقط' },
      { status: 400 }
    );
  }

  try {
    const db = getFirebaseAdminFirestore();
    const nowIso = new Date().toISOString();

  // 6. Ensure Owner Global Profile exists in /users/{uid}
  const userRef = db.doc(firestorePaths.user(uid));
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    await userRef.set({
      id: uid,
      email,
      displayName,
      phoneNumber: phoneNumber || null,
      photoUrl: verifiedUser.photoURL || null,
      disabled: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  // 7. Check In-Flight / Existing Provisioning State (/tenant_provisioning/{uid})
  const provDocRef = db.doc(firestorePaths.tenantProvisioning(uid));
  const provSnap = await provDocRef.get();

  let tenantId: string;
  let activeSlug = slug;

  if (provSnap.exists) {
    const existingProv = provSnap.data() as TenantProvisioningDoc;

    // A. Idempotent Replay: User already completed provisioning
    if (existingProv.status === 'COMPLETED' && existingProv.tenantId) {
      const existingTenantSnap = await db.doc(firestorePaths.tenant(existingProv.tenantId)).get();
      if (existingTenantSnap.exists) {
        const tenantData = existingTenantSnap.data();
        if (tenantData?.status === 'ACTIVE') {
          return NextResponse.json(
            {
              success: true,
              tenantId: existingProv.tenantId,
              slug: existingProv.slug || slug,
              redirectUrl: `https://${existingProv.slug || slug}.rashx.org/login`,
              alreadyProvisioned: true,
            },
            { status: 200 }
          );
        }
      }
    }

    // B. Safe Resume: Tenant already created in previous attempt, but CR upload/metadata was interrupted
    if (
      existingProv.step === 'TENANT_PROVISIONED' ||
      existingProv.step === 'CERTIFICATE_UPLOADED'
    ) {
      if (existingProv.tenantId && existingProv.slug) {
        tenantId = existingProv.tenantId;
        activeSlug = existingProv.slug;
      } else {
        tenantId = '';
      }
    } else {
      tenantId = '';
    }
  } else {
    tenantId = '';
  }

  // 8. Execute or Resume Tenant Provisioning
  const tenantRepo = new TenantRepository(db);

  if (!tenantId) {
    // Record in-progress initialization
    const initialProvRecord: TenantProvisioningDoc = TenantProvisioningDocSchema.parse({
      ownerUid: uid,
      slug,
      crNumber,
      status: 'IN_PROGRESS',
      step: 'USER_CREATED',
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    await provDocRef.set(initialProvRecord);

    try {
      const provisioningResult = await tenantRepo.createTenant(
        {
          slug,
          name,
          commercialName,
          crNumber,
          primaryOwnerUid: uid,
          billingEmail: email,
          subscriptionTier: 'STARTER',
        },
        { callerUid: uid }
      );

      tenantId = provisioningResult.tenantId;
      activeSlug = provisioningResult.slug;

      // Update provisioning record with tenant identity
      await provDocRef.update({
        tenantId,
        slug: activeSlug,
        step: 'TENANT_PROVISIONED',
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      await provDocRef.update({
        status: 'FAILED',
        error: err.message || 'Provisioning error',
        updatedAt: new Date().toISOString(),
      }).catch(() => {});

      if (err instanceof TenantProvisioningError) {
        if (err.code === TenantProvisioningErrorCode.SLUG_ALREADY_EXISTS) {
          return NextResponse.json(
            { error: 'اسم النطاق المطلوب محجوز مسبقاً. يرجى اختيار اسم آخر.' },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: `تعذر إنشاء المنشأة: ${err.message}` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'حدث خطأ أثناء معالجة تسجيل المنشأة. يرجى المحاولة لاحقاً.' },
        { status: 500 }
      );
    }
  }

  // 9. Upload Certificate File to Private Firebase Storage
  const ext = detectedMime === 'application/pdf' ? 'pdf' : detectedMime === 'image/jpeg' ? 'jpg' : 'png';
  const certificateStoragePath = `tenants/${tenantId}/certificates/${randomUUID()}.${ext}`;
  const originalFileName = (certificateFile as File).name || `cr_certificate.${ext}`;

  try {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aya2-a5057.firebasestorage.app';
    const storage = getFirebaseAdminStorage();
    const bucket = storage.bucket(bucketName);
    const fileRef = bucket.file(certificateStoragePath);

    await fileRef.save(fileBuffer, {
      contentType: detectedMime,
      metadata: {
        tenantId,
        uploadedByUid: uid,
        originalName: originalFileName,
        crNumber,
      },
    });

    await provDocRef.update({
      certificateStoragePath,
      step: 'CERTIFICATE_UPLOADED',
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  } catch (storageError) {
    console.warn('[Provisioning] Notice: Storage upload bypassed or encountered an issue:', storageError);
  }

  // 10. Store Commercial Registration Verification Record in Firestore
  const crRecordData: CommercialRegistrationDoc = CommercialRegistrationDocSchema.parse({
    tenantId,
    crNumber,
    certificateStoragePath,
    certificateFileName: originalFileName,
    certificateContentType: detectedMime,
    certificateFileSizeBytes: fileBuffer.byteLength,
    status: 'PENDING_REVIEW',
    uploadedByUid: uid,
    uploadedAt: nowIso,
    updatedAt: nowIso,
  });

  const crDocRef = db.doc(firestorePaths.commercialRegistration(tenantId));
  await crDocRef.set(crRecordData);

  // 11. Mark Provisioning as COMPLETED
  await provDocRef.update({
    status: 'COMPLETED',
    step: 'CR_METADATA_SAVED',
    updatedAt: new Date().toISOString(),
  }).catch(() => {});

  // 12. Success Response
  return NextResponse.json(
    {
      success: true,
      tenantId,
      slug: activeSlug,
      redirectUrl: `https://${activeSlug}.rashx.org/login`,
    },
    { status: 201 }
  );
  } catch (err: any) {
    console.error('[API /api/tenant/provision] Unexpected provisioning error:', err);
    if (err?.name === 'ConfigurationError') {
      return NextResponse.json(
        { error: 'إعدادات Firebase Admin مفقودة في الخادم. يرجى تهيئة متغيرات البيئة.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: err?.message || 'حدث خطأ أثناء معالجة تسجيل المنشأة. يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}
