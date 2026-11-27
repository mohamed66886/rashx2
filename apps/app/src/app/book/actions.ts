'use server';

import {
  getFirebaseAdminFirestore,
  firestorePaths,
  CustomerRepository,
  BookingRepository,
  AvailabilityService,
} from '@/lib/firebase-server';
import { riyadhTimeToUtcIso, normalizeSaudiPhoneNumber } from '@rashx/database';

export async function getAvailableSalonsAction() {
  const db = getFirebaseAdminFirestore();
  const snap = await db.collection(firestorePaths.tenants()).where('status', '==', 'ACTIVE').get();
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: (data.name as string) || d.id,
        slug: (data.slug as string) || d.id,
      };
    });
}

export async function getTenantBranchesAction(tenantId: string) {
  const db = getFirebaseAdminFirestore();
  const snap = await db
    .collection(firestorePaths.publicBranches(tenantId))
    .where('isActive', '==', true)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: (data.name as string) || d.id,
      city: (data.city as string) || '',
      district: (data.district as string) || '',
      address: (data.address as string) || '',
    };
  });
}

export async function getTenantServicesAction(tenantId: string, branchId: string) {
  const db = getFirebaseAdminFirestore();
  const snap = await db
    .collection(firestorePaths.publicServices(tenantId))
    .where('isActive', '==', true)
    .get();

  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: (data.nameAr as string) || (data.name as string) || d.id,
        durationMinutes: (data.durationMinutes as number) || 30,
        totalPriceHalalas: (data.totalPriceHalalas as number) || (data.priceHalalas as number) || 0,
        assignedBranchIds: (data.assignedBranchIds as string[]) || [],
      };
    })
    .filter((s) => s.assignedBranchIds.includes(branchId));
}

export async function getTenantProvidersAction(
  tenantId: string,
  branchId: string,
  serviceId: string
) {
  const db = getFirebaseAdminFirestore();
  const providersSnap = await db
    .collection(firestorePaths.providers(tenantId))
    .where('status', '==', 'ACTIVE')
    .get();

  const serviceSnap = await db.doc(firestorePaths.service(tenantId, serviceId)).get();
  const assignedProvidersOnService = (serviceSnap.data()?.assignedProviderIds as string[]) || [];

  return providersSnap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        displayNameAr: (data.displayNameAr as string) || '',
        assignedBranchIds: (data.assignedBranchIds as string[]) || [],
        assignedServiceIds: (data.assignedServiceIds as string[]) || [],
      };
    })
    .filter((p) => {
      const inBranch = p.assignedBranchIds.includes(branchId);
      const canDoService =
        p.assignedServiceIds.includes(serviceId) || assignedProvidersOnService.includes(p.id);
      return inBranch && canDoService;
    });
}

export async function getCustomerAvailabilitySlotsAction(
  tenantId: string,
  branchId: string,
  serviceId: string,
  date: string,
  providerId?: string
) {
  try {
    const availabilityService = new AvailabilityService();
    const result = await availabilityService.getAvailableSlots({
      tenantId,
      branchId,
      serviceId,
      date,
      providerId: providerId || undefined,
    });
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'تعذر جلب الأوقات المتاحة.' };
  }
}

export async function submitCustomerBookingAction(formData: FormData) {
  const tenantId = formData.get('tenantId') as string;
  const branchId = formData.get('branchId') as string;
  const serviceId = formData.get('serviceId') as string;
  const providerId = formData.get('providerId') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const customerName = formData.get('customerName') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const customerEmail = (formData.get('customerEmail') as string) || undefined;
  const customerNotes = (formData.get('customerNotes') as string) || '';

  if (!tenantId || !branchId || !serviceId || !providerId || !date || !time || !customerName || !customerPhone) {
    return { success: false, error: 'جميع الحقول الأساسية وتفاصيل الموعد والعميل مطلوبة.' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizeSaudiPhoneNumber(customerPhone);
  } catch (err: any) {
    return { success: false, error: err.message || 'رقم الجوال غير صالح.' };
  }

  try {
    const customerRepo = new CustomerRepository();
    // System context actor for customer-facing self-service
    const systemActor = { uid: 'CUSTOMER_GUEST', role: 'OWNER' as const };

    // Find existing customer by phone or create new one
    let customer = await customerRepo.getCustomerByPhone(systemActor, tenantId, normalizedPhone);
    if (!customer) {
      customer = await customerRepo.createCustomer(systemActor, {
        tenantId,
        fullName: customerName,
        phone: normalizedPhone,
        email: customerEmail,
      });
    }

    const startTimeIso = riyadhTimeToUtcIso(date, time);
    const bookingRepo = new BookingRepository();

    const booking = await bookingRepo.createBooking(
      { uid: customer.id, isCustomer: true },
      {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId: customer.id,
        scheduledStartTime: startTimeIso,
        customerNotes,
        source: 'ONLINE_APP',
        initialStatus: 'CONFIRMED',
      }
    );

    return {
      success: true,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      scheduledStartTime: booking.scheduledStartTime,
      serviceName: booking.serviceNameSnapshot.ar,
      totalPriceHalalas: booking.priceSnapshot.totalPriceHalalas,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل إتمام الحجز، يرجى المحاولة لاحقاً.' };
  }
}

