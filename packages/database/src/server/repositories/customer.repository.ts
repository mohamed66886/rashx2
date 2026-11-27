import 'server-only';
import type { Firestore, Transaction } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  CustomerDocSchema,
  CustomerPhoneIdentityDocSchema,
  CreateCustomerInputSchema,
  UpdateCustomerInputSchema,
  normalizeSaudiPhoneNumber,
  type CustomerDoc,
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type CustomerStatus,
} from '../../customer.schema';
import { hasPermission, canViewCustomerNotes } from '../../permissions';
import { TrustedSystemContext } from './trusted-context';

export enum CustomerErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  PHONE_ALREADY_EXISTS = 'PHONE_ALREADY_EXISTS',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
}

export class CustomerError extends Error {
  constructor(
    public readonly code: CustomerErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'CustomerError';
  }
}

export type CustomerActor =
  | TrustedSystemContext
  | {
      uid: string;
      role: 'OWNER' | 'MANAGER' | 'STAFF';
      customPermissions?: readonly string[] | null;
      isPlatformAdmin?: boolean;
    };

export interface CustomerListOptions {
  search?: string;
  status?: CustomerStatus;
  limit?: number;
}

export class CustomerRepository {
  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {}

  private verifyPermission(
    actor: CustomerActor,
    capability: Parameters<typeof hasPermission>[1]
  ): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (!hasPermission(actor.role, capability, actor.customPermissions)) {
      throw new CustomerError(
        CustomerErrorCode.FORBIDDEN,
        `غير مصرح: لا تملك صلاحية (${capability}) لإجراء هذه العملية على بيانات العملاء.`
      );
    }
  }

  private sanitizeCustomer(actor: CustomerActor, customer: CustomerDoc): CustomerDoc {
    if (TrustedSystemContext.isTrusted(actor) || actor.isPlatformAdmin) {
      return customer;
    }
    const canSeeNotes = canViewCustomerNotes(actor.role, actor.customPermissions);
    if (!canSeeNotes) {
      return {
        ...customer,
        privateNotes: '',
      };
    }
    return customer;
  }

  /**
   * Atomically creates a customer document and its deterministic phone identity mutex document.
   * Prevents duplicate active customers with the same normalized phone number in the tenant.
   */
  async createCustomer(
    actor: CustomerActor,
    rawInput: CreateCustomerInput
  ): Promise<CustomerDoc> {
    this.verifyPermission(actor, 'customers.create');

    const parseResult = CreateCustomerInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new CustomerError(
        CustomerErrorCode.INVALID_PAYLOAD,
        `بيانات إنشاء العميل غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    const rawPhone = typeof input.phone === 'string' ? input.phone.trim() : '';
    const hasPhone = rawPhone.length > 0;
    const normalizedPhone = hasPhone ? normalizeSaudiPhoneNumber(rawPhone) : null;
    const tenantId = input.tenantId;

    const actorUid = TrustedSystemContext.isTrusted(actor)
      ? 'SYSTEM'
      : actor.isPlatformAdmin
        ? 'PLATFORM_ADMIN'
        : actor.uid;

    // Guest / idempotent retry protection
    if (input.idempotencyKey) {
      const idempSnap = await this.firestore
        .doc(firestorePaths.customerGuestIdempotency(tenantId, input.idempotencyKey))
        .get();
      if (idempSnap.exists) {
        const existingCustomerId = idempSnap.data()?.customerId;
        if (existingCustomerId) {
          const existingCust = await this.getCustomerById(actor, tenantId, existingCustomerId);
          if (existingCust) return existingCust;
        }
      }
    }

    const customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const custRef = this.firestore.doc(firestorePaths.tenantCustomer(tenantId, customerId));
    const identityRef = normalizedPhone
      ? this.firestore.doc(firestorePaths.tenantCustomerIdentity(tenantId, normalizedPhone))
      : null;
    const idempRef = input.idempotencyKey
      ? this.firestore.doc(firestorePaths.customerGuestIdempotency(tenantId, input.idempotencyKey))
      : null;

    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      // 0. Check idempotency inside transaction as well
      if (idempRef) {
        const idempTxSnap = await transaction.get(idempRef);
        if (idempTxSnap.exists) {
          const existingId = idempTxSnap.data()?.customerId;
          if (existingId) {
            const existingCustSnap = await transaction.get(
              this.firestore.doc(firestorePaths.tenantCustomer(tenantId, existingId))
            );
            if (existingCustSnap.exists) {
              return CustomerDocSchema.parse(existingCustSnap.data());
            }
          }
        }
      }

      // 1. Read deterministic phone identity lock when a phone number is provided
      if (identityRef && normalizedPhone) {
        const identitySnap = await transaction.get(identityRef);
        if (identitySnap.exists) {
          const existingData = identitySnap.data();
          const existingCustId = existingData?.customerId;
          if (existingCustId) {
            const existingCustSnap = await transaction.get(
              this.firestore.doc(firestorePaths.tenantCustomer(tenantId, existingCustId))
            );
            if (existingCustSnap.exists && existingCustSnap.data()?.status === 'ACTIVE') {
              throw new CustomerError(
                CustomerErrorCode.PHONE_ALREADY_EXISTS,
                `يوجد عميل نشط مسجل مسبقاً برقم الجوال (${normalizedPhone}) في هذه المنشأة.`
              );
            }
          }
        }
      }

      const newCustomer: CustomerDoc = CustomerDocSchema.parse({
        id: customerId,
        tenantId,
        fullName: input.fullName.trim(),
        isGuest: input.isGuest || !hasPhone,
        normalizedPhone,
        displayPhone: hasPhone ? rawPhone : null,
        email: input.email ? input.email.trim() : null,
        dateOfBirth: input.dateOfBirth || null,
        gender: input.gender || 'UNSPECIFIED',
        privateNotes: input.privateNotes ? input.privateNotes.trim() : '',
        tags: input.tags || [],
        status: 'ACTIVE',
        bookingStatistics: {
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          noShowBookings: 0,
          totalSpentHalalas: 0,
          lastBookingAt: null,
        },
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: actorUid,
        updatedBy: actorUid,
      });

      const auditId = `audit_cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.bookingAuditRecord(tenantId, auditId));

      transaction.set(custRef, newCustomer);
      if (identityRef && normalizedPhone) {
        const phoneIdentity = CustomerPhoneIdentityDocSchema.parse({
          normalizedPhone,
          customerId,
          tenantId,
          createdAt: nowIso,
        });
        transaction.set(identityRef, phoneIdentity);
      }
      if (idempRef) {
        transaction.set(idempRef, {
          customerId,
          tenantId,
          idempotencyKey: input.idempotencyKey,
          createdAt: nowIso,
        });
      }
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        actorUid,
        entityType: 'CUSTOMER',
        entityId: customerId,
        action: 'CUSTOMER_CREATED',
        afterValues: {
          fullName: newCustomer.fullName,
          normalizedPhone: newCustomer.normalizedPhone,
          isGuest: newCustomer.isGuest,
        },
        timestamp: nowIso,
      });

      return newCustomer;
    });
  }

  /**
   * Retrieves a customer by ID with notes masking for unauthorized roles.
   */
  async getCustomerById(
    actor: CustomerActor,
    tenantId: string,
    customerId: string
  ): Promise<CustomerDoc | null> {
    this.verifyPermission(actor, 'customers.read');

    const snap = await this.firestore.doc(firestorePaths.tenantCustomer(tenantId, customerId)).get();
    if (!snap.exists) return null;

    const data = CustomerDocSchema.parse(snap.data());
    return this.sanitizeCustomer(actor, data);
  }

  /**
   * Retrieves a customer by normalized or raw Saudi phone number.
   */
  async getCustomerByPhone(
    actor: CustomerActor,
    tenantId: string,
    rawPhone: string
  ): Promise<CustomerDoc | null> {
    this.verifyPermission(actor, 'customers.read');

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeSaudiPhoneNumber(rawPhone);
    } catch {
      return null;
    }

    const identitySnap = await this.firestore
      .doc(firestorePaths.tenantCustomerIdentity(tenantId, normalizedPhone))
      .get();

    if (!identitySnap.exists) return null;
    const customerId = identitySnap.data()?.customerId;
    if (!customerId) return null;

    return this.getCustomerById(actor, tenantId, customerId);
  }

  /**
   * Lists customers in a tenant with search, filtering, and privacy masking.
   */
  async listCustomers(
    actor: CustomerActor,
    tenantId: string,
    options: CustomerListOptions = {}
  ): Promise<{ customers: CustomerDoc[]; totalCount: number }> {
    this.verifyPermission(actor, 'customers.read');

    const colRef = this.firestore.collection(firestorePaths.tenantCustomers(tenantId));
    const targetStatus = options.status || 'ACTIVE';

    const snap = await colRef.where('status', '==', targetStatus).get();

    let customers = snap.docs.map((d) => CustomerDocSchema.parse(d.data()));

    // In-memory search if provided (by name or phone)
    if (options.search && options.search.trim() !== '') {
      const q = options.search.trim().toLowerCase();
      customers = customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          (c.normalizedPhone && c.normalizedPhone.includes(q)) ||
          (c.displayPhone && c.displayPhone.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    // Sort by createdAt descending
    customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCount = customers.length;
    const limit = options.limit || 50;
    const paginated = customers.slice(0, limit);

    return {
      customers: paginated.map((c) => this.sanitizeCustomer(actor, c)),
      totalCount,
    };
  }

  /**
   * Updates an existing customer with atomic phone identity migration if phone changed.
   */
  async updateCustomer(
    actor: CustomerActor,
    tenantId: string,
    customerId: string,
    rawInput: UpdateCustomerInput
  ): Promise<CustomerDoc> {
    this.verifyPermission(actor, 'customers.update');

    const parseResult = UpdateCustomerInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new CustomerError(
        CustomerErrorCode.INVALID_PAYLOAD,
        `بيانات تحديث العميل غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;

    const actorUid = TrustedSystemContext.isTrusted(actor)
      ? 'SYSTEM'
      : actor.isPlatformAdmin
        ? 'PLATFORM_ADMIN'
        : actor.uid;

    const custRef = this.firestore.doc(firestorePaths.tenantCustomer(tenantId, customerId));
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const snap = await transaction.get(custRef);
      if (!snap.exists) {
        throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, 'العميل غير موجود.');
      }
      const existing = CustomerDocSchema.parse(snap.data());

      let newNormalizedPhone = existing.normalizedPhone;
      let newDisplayPhone = existing.displayPhone;
      let oldIdentityRef = null;
      let newIdentityRef = null;

      if (input.phone) {
        const normalized = normalizeSaudiPhoneNumber(input.phone);
        if (normalized !== existing.normalizedPhone) {
          newNormalizedPhone = normalized;
          newDisplayPhone = input.phone;
          newIdentityRef = this.firestore.doc(
            firestorePaths.tenantCustomerIdentity(tenantId, newNormalizedPhone)
          );
          if (existing.normalizedPhone) {
            oldIdentityRef = this.firestore.doc(
              firestorePaths.tenantCustomerIdentity(tenantId, existing.normalizedPhone)
            );
          }

          const newIdentitySnap = await transaction.get(newIdentityRef);
          if (newIdentitySnap.exists && newIdentitySnap.data()?.customerId !== customerId) {
            throw new CustomerError(
              CustomerErrorCode.PHONE_ALREADY_EXISTS,
              `رقم الجوال (${newNormalizedPhone}) مسجل لعميل آخر بالمنشأة.`
            );
          }
        }
      }

      const updatedCustomer: CustomerDoc = CustomerDocSchema.parse({
        ...existing,
        fullName: input.fullName !== undefined ? input.fullName.trim() : existing.fullName,
        isGuest: newNormalizedPhone ? false : existing.isGuest,
        normalizedPhone: newNormalizedPhone,
        displayPhone: newDisplayPhone,
        email: input.email !== undefined ? (input.email ? input.email.trim() : null) : existing.email,
        dateOfBirth: input.dateOfBirth !== undefined ? input.dateOfBirth : existing.dateOfBirth,
        gender: input.gender !== undefined ? input.gender : existing.gender,
        privateNotes: input.privateNotes !== undefined ? input.privateNotes.trim() : existing.privateNotes,
        tags: input.tags !== undefined ? input.tags : existing.tags,
        status: input.status !== undefined ? input.status : existing.status,
        updatedAt: nowIso,
        updatedBy: actorUid,
      });

      transaction.set(custRef, updatedCustomer);

      if (oldIdentityRef) {
        transaction.delete(oldIdentityRef);
      }
      if (newIdentityRef && newNormalizedPhone) {
        transaction.set(newIdentityRef, {
          normalizedPhone: newNormalizedPhone,
          customerId,
          tenantId,
          createdAt: nowIso,
        });
      }

      const auditId = `audit_cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.bookingAuditRecord(tenantId, auditId));
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        actorUid,
        entityType: 'CUSTOMER',
        entityId: customerId,
        action: 'CUSTOMER_UPDATED',
        timestamp: nowIso,
      });

      return updatedCustomer;
    });
  }

  /**
   * Archives a customer without deleting historical bookings.
   */
  async archiveCustomer(
    actor: CustomerActor,
    tenantId: string,
    customerId: string
  ): Promise<CustomerDoc> {
    this.verifyPermission(actor, 'customers.archive');

    const actorUid = TrustedSystemContext.isTrusted(actor)
      ? 'SYSTEM'
      : actor.isPlatformAdmin
        ? 'PLATFORM_ADMIN'
        : actor.uid;

    const custRef = this.firestore.doc(firestorePaths.tenantCustomer(tenantId, customerId));
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const snap = await transaction.get(custRef);
      if (!snap.exists) {
        throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, 'العميل غير موجود.');
      }
      const existing = CustomerDocSchema.parse(snap.data());

      const updatedCustomer: CustomerDoc = {
        ...existing,
        status: 'ARCHIVED',
        updatedAt: nowIso,
        updatedBy: actorUid,
      };

      transaction.set(custRef, updatedCustomer);

      // We do not delete identity doc so nobody else can take over this active identity inadvertently,
      // or we can keep it as pointer to archived customer.
      const auditId = `audit_cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.bookingAuditRecord(tenantId, auditId));
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        actorUid,
        entityType: 'CUSTOMER',
        entityId: customerId,
        action: 'CUSTOMER_ARCHIVED',
        timestamp: nowIso,
      });

      return updatedCustomer;
    });
  }
}

