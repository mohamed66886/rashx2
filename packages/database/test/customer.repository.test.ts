import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  CustomerRepository,
  CustomerError,
  CustomerErrorCode,
} from '../src/server/repositories/customer.repository';
import { normalizeSaudiPhoneNumber } from '../src/customer.schema';
import { firestorePaths } from '../src/paths';
import { createTrustedSystemContext } from '../src/server/internal/trusted-system';

class InMemoryCustomerFirestore {
  private store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
    } as unknown as DocumentReference;
  }

  collection(collectionPath: string) {
    return {
      path: collectionPath,
      doc: (id?: string) => {
        const docId = id || `auto_${Math.random().toString(36).substring(2, 10)}`;
        return this.doc(`${collectionPath}/${docId}`);
      },
      where: (field: string, op: string, value: unknown) => {
        return {
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [p, data] of this.store.entries()) {
              if (p.startsWith(collectionPath + '/') && p.split('/').length === collectionPath.split('/').length + 1) {
                if (data && data[field] === value) {
                  docs.push(this.createSnapshot(p));
                }
              }
            }
            return { docs };
          },
        };
      },
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [p] of this.store.entries()) {
          if (p.startsWith(collectionPath + '/') && p.split('/').length === collectionPath.split('/').length + 1) {
            docs.push(this.createSnapshot(p));
          }
        }
        return { docs };
      },
    };
  }

  private createSnapshot(path: string): DocumentSnapshot {
    const exists = this.store.has(path);
    const data = exists ? JSON.parse(JSON.stringify(this.store.get(path))) : undefined;
    return {
      id: path.split('/').pop()!,
      ref: this.doc(path),
      exists,
      data: () => data,
    } as unknown as DocumentSnapshot;
  }

  setDocumentDirect(path: string, data: Record<string, unknown>) {
    this.store.set(path, JSON.parse(JSON.stringify(data)));
  }

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const stagedWrites = new Map<string, Record<string, unknown>>();
    const stagedDeletes = new Set<string>();

    const mockTransaction: Transaction = {
      get: async (target: DocumentReference) => {
        const p = target.path;
        return this.createSnapshot(p);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const existing = this.store.get(ref.path) || {};
        stagedWrites.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        return mockTransaction;
      },
      delete: (ref: DocumentReference) => {
        stagedDeletes.add(ref.path);
        return mockTransaction;
      },
    } as unknown as Transaction;

    const result = await updateFunction(mockTransaction);

    for (const [p, data] of stagedWrites.entries()) {
      this.store.set(p, data);
    }
    for (const p of stagedDeletes) {
      this.store.delete(p);
    }

    return result;
  }
}

describe('CustomerRepository & Saudi Phone Normalization', () => {
  let mockFirestore: InMemoryCustomerFirestore;
  let repo: CustomerRepository;
  const tenantA = 'tenant_salon_alpha';
  const tenantB = 'tenant_salon_beta';

  const ownerActor = {
    uid: 'owner_1',
    role: 'OWNER' as const,
  };

  const staffActor = {
    uid: 'staff_1',
    role: 'STAFF' as const,
    customPermissions: ['customers.read'],
  };

  beforeEach(() => {
    mockFirestore = new InMemoryCustomerFirestore();
    repo = new CustomerRepository(mockFirestore as unknown as Firestore);
  });

  describe('normalizeSaudiPhoneNumber', () => {
    it('normalizes 05XXXXXXXX to +9665XXXXXXXX', () => {
      expect(normalizeSaudiPhoneNumber('0501234567')).toBe('+966501234567');
      expect(normalizeSaudiPhoneNumber('0559988776')).toBe('+966559988776');
    });

    it('normalizes Arabic-Indic numerals', () => {
      expect(normalizeSaudiPhoneNumber('٠٥٠١٢٣٤٥٦٧')).toBe('+966501234567');
      expect(normalizeSaudiPhoneNumber('٩٦٦٥٠١٢٣٤٥٦٧')).toBe('+966501234567');
    });

    it('normalizes numbers with spaces, hyphens, and parentheses', () => {
      expect(normalizeSaudiPhoneNumber('+966 50 123-4567')).toBe('+966501234567');
      expect(normalizeSaudiPhoneNumber('(050) 123 4567')).toBe('+966501234567');
    });

    it('normalizes 9665XXXXXXXX and 009665XXXXXXXX', () => {
      expect(normalizeSaudiPhoneNumber('966501234567')).toBe('+966501234567');
      expect(normalizeSaudiPhoneNumber('00966501234567')).toBe('+966501234567');
    });

    it('rejects invalid numbers', () => {
      expect(() => normalizeSaudiPhoneNumber('0112345678')).toThrow(); // Landline 01
      expect(() => normalizeSaudiPhoneNumber('050123456')).toThrow(); // 8 digits
      expect(() => normalizeSaudiPhoneNumber('05012345678')).toThrow(); // 11 digits
      expect(() => normalizeSaudiPhoneNumber('invalid')).toThrow();
    });
  });

  describe('Customer Creation & Phone Identity Reservation', () => {
    it('creates a new customer and sets deterministic phone identity mutex document', async () => {
      const created = await repo.createCustomer(ownerActor, {
        tenantId: tenantA,
        fullName: 'نورة السبيعي',
        phone: '0501234567',
        email: 'noura@example.com',
        privateNotes: 'تفضل القهوة السعودية بدون سكر',
        tags: ['VIP'],
      });

      expect(created.id).toMatch(/^cust_/);
      expect(created.normalizedPhone).toBe('+966501234567');
      expect(created.fullName).toBe('نورة السبيعي');
      expect(created.status).toBe('ACTIVE');

      // Check phone identity document exists in store
      const identityPath = firestorePaths.tenantCustomerIdentity(tenantA, '+966501234567');
      const identitySnap = await mockFirestore.doc(identityPath).get();
      expect(identitySnap.exists).toBe(true);
      expect(identitySnap.data()?.customerId).toBe(created.id);
    });

    it('rejects duplicate active customer creation with the same phone in the same tenant', async () => {
      await repo.createCustomer(ownerActor, {
        tenantId: tenantA,
        fullName: 'نورة السبيعي',
        phone: '0501234567',
      });

      // Second attempt with formatted phone
      await expect(
        repo.createCustomer(ownerActor, {
          tenantId: tenantA,
          fullName: 'نورة أخرى',
          phone: '+966 50 123 4567',
        })
      ).rejects.toThrow(CustomerError);
    });

    it('allows same phone number in different tenants (Strict Tenant Isolation)', async () => {
      const custA = await repo.createCustomer(ownerActor, {
        tenantId: tenantA,
        fullName: 'نورة السبيعي',
        phone: '0501234567',
      });

      const custB = await repo.createCustomer(ownerActor, {
        tenantId: tenantB,
        fullName: 'نورة في صالون آخر',
        phone: '0501234567',
      });

      expect(custA.id).not.toBe(custB.id);
      expect(custA.tenantId).toBe(tenantA);
      expect(custB.tenantId).toBe(tenantB);
    });
  });

  describe('Privacy & Notes Masking', () => {
    it('masks privateNotes for unauthorized roles (STAFF)', async () => {
      const created = await repo.createCustomer(ownerActor, {
        tenantId: tenantA,
        fullName: 'منى العبدالله',
        phone: '0555555555',
        privateNotes: 'ملاحظة شديدة الخصوصية والحساسية',
      });

      const fetchedByOwner = await repo.getCustomerById(ownerActor, tenantA, created.id);
      expect(fetchedByOwner?.privateNotes).toBe('ملاحظة شديدة الخصوصية والحساسية');

      const fetchedByStaff = await repo.getCustomerById(staffActor, tenantA, created.id);
      expect(fetchedByStaff?.privateNotes).toBe(''); // Masked!
    });
  });

  describe('Updating & Archiving', () => {
    it('updates customer details and migrates phone identity when phone changes', async () => {
      const created = await repo.createCustomer(ownerActor, {
        tenantId: tenantA,
        fullName: 'هند خالد',
        phone: '0501111111',
      });

      const updated = await repo.updateCustomer(ownerActor, tenantA, created.id, {
        fullName: 'هند خالد التميمي',
        phone: '0502222222',
      });

      expect(updated.fullName).toBe('هند خالد التميمي');
      expect(updated.normalizedPhone).toBe('+966502222222');

      // Old identity deleted, new identity exists
      const oldSnap = await mockFirestore.doc(firestorePaths.tenantCustomerIdentity(tenantA, '+966501111111')).get();
      expect(oldSnap.exists).toBe(false);

      const newSnap = await mockFirestore.doc(firestorePaths.tenantCustomerIdentity(tenantA, '+966502222222')).get();
      expect(newSnap.exists).toBe(true);
      expect(newSnap.data()?.customerId).toBe(created.id);
    });

    it('archives customer successfully without deletion', async () => {
      const created = await repo.createCustomer(ownerActor, {
        tenantId: tenantA,
        fullName: 'ريم الناصر',
        phone: '0503333333',
      });

      const archived = await repo.archiveCustomer(ownerActor, tenantA, created.id);
      expect(archived.status).toBe('ARCHIVED');

      const fetched = await repo.getCustomerById(ownerActor, tenantA, created.id);
      expect(fetched?.status).toBe('ARCHIVED');
    });
  });
});
