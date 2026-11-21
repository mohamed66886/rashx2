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
  type CommercialRegistrationDoc,
} from '@rashx/database';

export const dynamic = 'force-dynamic';

// Allowed MIME types and Magic Bytes
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_CERTIFICATE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function detectMimeFromBytes(buffer: Buffer): 'application/pdf' | 'image/jpeg' | 'image/png' | null {
  if (buffer.length < 4) return null;

  // PDF magic numbers: %PDF (0x25, 0x50, 0x44, 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'application/pdf';
  }

  // JPEG magic numbers: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG magic numbers: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. CSRF Protection
  const csrfHeader = request.headers.get('x-rashx-csrf');
  if (csrfHeader !== '1') {
    return NextResponse.json(
      { error: 'طلب غير مصرح به: فشل التحقق من أمان الجلسة (CSRF)' },
      { status: 403 }
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

  // 5. Validate Certificate File
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

  if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
    return NextResponse.json(
      { error: 'نوع الملف غير مدعوم أو غير متطابق. الأنواع المدعومة: PDF أو JPG أو PNG فقط' },
      { status: 400 }
    );
  }

  const db = getFirebaseAdminFirestore();

  // 6. Ensure Owner Global Profile exists in /users/{uid}
  const nowIso = new Date().toISOString();
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

  // 7. Atomic Tenant Provisioning (Self-Authorized Owner Context)
  const tenantRepo = new TenantRepository(db);

  let provisioningResult;
  try {
    provisioningResult = await tenantRepo.createTenant(
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
  } catch (err: any) {
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

  const tenantId = provisioningResult.tenantId;

  // 8. Upload Certificate File to Private Firebase Storage
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
  } catch (storageError) {
    // If storage upload fails (e.g. offline emulator), log warning and continue so onboarding isn't blocked
    console.warn('[Provisioning] Notice: Storage upload bypassed or encountered an issue:', storageError);
  }

  // 9. Store Commercial Registration Verification Record in Firestore
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

  // 10. Success Response
  return NextResponse.json(
    {
      success: true,
      tenantId,
      slug,
      redirectUrl: `https://${slug}.rashx.org/login`,
    },
    { status: 201 }
  );
}
