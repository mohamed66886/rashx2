import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  BranchDocSchema,
  PublicBranchSchema,
  CreateBranchInputSchema,
  UpdateBranchInputSchema,
  MainBranchPointerDocSchema,
  type BranchDoc,
  type PublicBranch,
  type CreateBranchInput,
  type UpdateBranchInput,
  type OperatingHoursWeekly,
  type MainBranchPointerDoc,
} from '../../branch.schema';

export const DEFAULT_OPERATING_HOURS: OperatingHoursWeekly = {
  saturday: { open: '09:00', close: '22:00', isClosed: false },
  sunday: { open: '09:00', close: '22:00', isClosed: false },
  monday: { open: '09:00', close: '22:00', isClosed: false },
  tuesday: { open: '09:00', close: '22:00', isClosed: false },
  wednesday: { open: '09:00', close: '22:00', isClosed: false },
  thursday: { open: '09:00', close: '22:00', isClosed: false },
  friday: { open: '13:00', close: '22:00', isClosed: false },
};

export class BranchRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  /**
   * Retrieves all branches for a tenant.
   */
  async listBranches(tenantId: string): Promise<BranchDoc[]> {
    const snap = await this.db
      .collection(firestorePaths.branches(tenantId))
      .get();

    return snap.docs.map((doc) => BranchDocSchema.parse(doc.data()));
  }

  /**
   * Retrieves a single branch by ID.
   */
  async getBranchById(tenantId: string, branchId: string): Promise<BranchDoc | null> {
    const snap = await this.db
      .doc(firestorePaths.branch(tenantId, branchId))
      .get();

    if (!snap.exists) {
      return null;
    }
    return BranchDocSchema.parse(snap.data());
  }

  /**
   * Retrieves the designated main branch for a tenant.
   * Leverages the authoritative main branch pointer with fallback to query.
   */
  async getMainBranch(tenantId: string): Promise<BranchDoc | null> {
    const pointerRef = this.db.doc(firestorePaths.mainBranchPointer(tenantId));
    const pointerSnap = await pointerRef.get();

    if (pointerSnap.exists) {
      const pointer = MainBranchPointerDocSchema.parse(pointerSnap.data());
      const branch = await this.getBranchById(tenantId, pointer.mainBranchId);
      if (branch && branch.isMain) {
        return branch;
      }
    }

    // Fallback: Query by isMain == true and heal the pointer
    const snap = await this.db
      .collection(firestorePaths.branches(tenantId))
      .where('isMain', '==', true)
      .limit(1)
      .get();

    if (snap.empty || !snap.docs[0]) {
      return null;
    }
    const branch = BranchDocSchema.parse(snap.docs[0].data());
    await pointerRef.set({
      tenantId,
      mainBranchId: branch.id,
      updatedAt: new Date().toISOString(),
      version: 1,
    });
    return branch;
  }

  /**
   * Creates a new branch. Ensures single main branch invariant.
   * Atomically synchronizes public branch projection and serializes concurrent promotions.
   */
  async createBranch(tenantId: string, input: unknown): Promise<BranchDoc> {
    const parsed = CreateBranchInputSchema.parse(input);
    const nowIso = new Date().toISOString();
    const branchId = this.db.collection(firestorePaths.branches(tenantId)).doc().id;

    const branchDocData: BranchDoc = BranchDocSchema.parse({
      id: branchId,
      tenantId,
      name: parsed.name,
      nameEn: parsed.nameEn,
      code: parsed.code || (parsed.isMain ? 'MAIN' : undefined),
      isMain: Boolean(parsed.isMain),
      city: parsed.city,
      district: parsed.district,
      region: parsed.region,
      country: parsed.country || 'SA',
      address: parsed.address,
      coordinates: parsed.coordinates,
      phone: parsed.phone,
      email: parsed.email,
      isActive: true,
      operatingHours: parsed.operatingHours,
      internalNotes: parsed.internalNotes,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    const publicBranchData: PublicBranch = PublicBranchSchema.parse({
      id: branchId,
      name: branchDocData.name,
      nameEn: branchDocData.nameEn,
      isMain: branchDocData.isMain,
      city: branchDocData.city,
      district: branchDocData.district,
      region: branchDocData.region,
      country: branchDocData.country,
      address: branchDocData.address,
      coordinates: branchDocData.coordinates,
      phone: branchDocData.phone,
      operatingHours: branchDocData.operatingHours,
      isActive: branchDocData.isActive,
    });

    const branchRef = this.db.doc(firestorePaths.branch(tenantId, branchId));
    const publicRef = this.db.doc(firestorePaths.publicBranch(tenantId, branchId));

    if (branchDocData.isMain) {
      // Transaction using mainBranchPointer mutex to eliminate race conditions
      await this.db.runTransaction(async (transaction) => {
        const pointerRef = this.db.doc(firestorePaths.mainBranchPointer(tenantId));
        const pointerSnap = await transaction.get(pointerRef);
        let version = 1;

        if (pointerSnap.exists) {
          const pointer = MainBranchPointerDocSchema.parse(pointerSnap.data());
          version = pointer.version + 1;
          const oldMainRef = this.db.doc(firestorePaths.branch(tenantId, pointer.mainBranchId));
          const oldMainSnap = await transaction.get(oldMainRef);
          if (oldMainSnap.exists) {
            transaction.update(oldMainRef, { isMain: false, updatedAt: nowIso });
            transaction.update(this.db.doc(firestorePaths.publicBranch(tenantId, pointer.mainBranchId)), {
              isMain: false,
            });
          }
        }

        const existingMainSnap = await transaction.get(
          this.db.collection(firestorePaths.branches(tenantId)).where('isMain', '==', true)
        );

        for (const doc of existingMainSnap.docs) {
          if (doc.id !== branchId) {
            transaction.update(doc.ref, { isMain: false, updatedAt: nowIso });
            transaction.update(
              this.db.doc(firestorePaths.publicBranch(tenantId, doc.id)),
              { isMain: false }
            );
          }
        }

        transaction.set(pointerRef, {
          tenantId,
          mainBranchId: branchId,
          updatedAt: nowIso,
          version,
        });
        transaction.set(branchRef, branchDocData);
        transaction.set(publicRef, publicBranchData);
      });
    } else {
      const batch = this.db.batch();
      batch.set(branchRef, branchDocData);
      batch.set(publicRef, publicBranchData);
      await batch.commit();
    }

    return branchDocData;
  }

  /**
   * Updates an existing branch. Handles main branch promotion and public projection sync.
   * Utilizes the main branch pointer mutex for OCC concurrency control.
   */
  async updateBranch(tenantId: string, branchId: string, input: unknown): Promise<BranchDoc> {
    const parsed = UpdateBranchInputSchema.parse(input);
    const nowIso = new Date().toISOString();

    const branchRef = this.db.doc(firestorePaths.branch(tenantId, branchId));
    const publicRef = this.db.doc(firestorePaths.publicBranch(tenantId, branchId));
    const pointerRef = this.db.doc(firestorePaths.mainBranchPointer(tenantId));

    return await this.db.runTransaction(async (transaction) => {
      const snap = await transaction.get(branchRef);
      if (!snap.exists) {
        throw new Error(`Branch '${branchId}' not found in tenant '${tenantId}'`);
      }

      const current = BranchDocSchema.parse(snap.data());
      if (current.tenantId !== tenantId) {
        throw new Error('Cross-tenant branch update is strictly prohibited.');
      }

      // Prevent unsetting main branch without appointing another
      if (current.isMain && parsed.isMain === false) {
        throw new Error('لا يمكن إلغاء تعيين الفرع الرئيسي مباشرة دون ترقية فرع آخر ليكون رئيسياً.');
      }

      const pointerSnap = await transaction.get(pointerRef);
      const pointer = pointerSnap.exists ? MainBranchPointerDocSchema.parse(pointerSnap.data()) : null;

      // Prevent deactivating a main branch
      if (parsed.isActive === false && (current.isMain || pointer?.mainBranchId === branchId)) {
        throw new Error('لا يمكن تعطيل الفرع الرئيسي للمنشأة. يجب تعيين فرع نشط رئيسي أولاً.');
      }

      // If promoting to main, demote others and update pointer mutex
      if (parsed.isMain && !current.isMain) {
        const nextVersion = (pointer?.version || 0) + 1;
        if (pointer?.mainBranchId && pointer.mainBranchId !== branchId) {
          const oldMainRef = this.db.doc(firestorePaths.branch(tenantId, pointer.mainBranchId));
          const oldMainSnap = await transaction.get(oldMainRef);
          if (oldMainSnap.exists) {
            transaction.update(oldMainRef, { isMain: false, updatedAt: nowIso });
            transaction.update(this.db.doc(firestorePaths.publicBranch(tenantId, pointer.mainBranchId)), {
              isMain: false,
            });
          }
        }

        const existingMainSnap = await transaction.get(
          this.db.collection(firestorePaths.branches(tenantId)).where('isMain', '==', true)
        );
        for (const doc of existingMainSnap.docs) {
          if (doc.id !== branchId) {
            transaction.update(doc.ref, { isMain: false, updatedAt: nowIso });
            transaction.update(
              this.db.doc(firestorePaths.publicBranch(tenantId, doc.id)),
              { isMain: false }
            );
          }
        }

        transaction.set(pointerRef, {
          tenantId,
          mainBranchId: branchId,
          updatedAt: nowIso,
          version: nextVersion,
        });
      }

      const updatedDocData: BranchDoc = BranchDocSchema.parse({
        ...current,
        ...parsed,
        id: branchId,
        tenantId,
        updatedAt: nowIso,
      });

      const updatedPublicData: PublicBranch = PublicBranchSchema.parse({
        id: branchId,
        name: updatedDocData.name,
        nameEn: updatedDocData.nameEn,
        isMain: updatedDocData.isMain,
        city: updatedDocData.city,
        district: updatedDocData.district,
        region: updatedDocData.region,
        country: updatedDocData.country,
        address: updatedDocData.address,
        coordinates: updatedDocData.coordinates,
        phone: updatedDocData.phone,
        operatingHours: updatedDocData.operatingHours,
        isActive: updatedDocData.isActive,
      });

      transaction.set(branchRef, updatedDocData);
      transaction.set(publicRef, updatedPublicData);

      return updatedDocData;
    });
  }

  /**
   * Deletes a branch safely. Ensures main branch can never be deleted.
   */
  async deleteBranch(tenantId: string, branchId: string): Promise<void> {
    const branchRef = this.db.doc(firestorePaths.branch(tenantId, branchId));
    const publicRef = this.db.doc(firestorePaths.publicBranch(tenantId, branchId));
    const pointerRef = this.db.doc(firestorePaths.mainBranchPointer(tenantId));

    await this.db.runTransaction(async (transaction) => {
      const snap = await transaction.get(branchRef);
      if (!snap.exists) {
        throw new Error(`Branch '${branchId}' not found in tenant '${tenantId}'`);
      }
      const branch = BranchDocSchema.parse(snap.data());
      if (branch.tenantId !== tenantId) {
        throw new Error('Cross-tenant branch deletion is strictly prohibited.');
      }

      const pointerSnap = await transaction.get(pointerRef);
      const pointer = pointerSnap.exists ? MainBranchPointerDocSchema.parse(pointerSnap.data()) : null;

      if (branch.isMain || pointer?.mainBranchId === branchId) {
        throw new Error('لا يمكن حذف الفرع الرئيسي للمنشأة.');
      }

      transaction.delete(branchRef);
      transaction.delete(publicRef);
    });
  }

  /**
   * Helper to create a canonical default main branch for a tenant.
   */
  async createDefaultMainBranch(
    tenantId: string,
    tenantName: string,
    nowIso: string = new Date().toISOString()
  ): Promise<BranchDoc> {
    const branchId = 'main-branch';
    const branchRef = this.db.doc(firestorePaths.branch(tenantId, branchId));
    const publicRef = this.db.doc(firestorePaths.publicBranch(tenantId, branchId));
    const pointerRef = this.db.doc(firestorePaths.mainBranchPointer(tenantId));

    const branchDocData: BranchDoc = BranchDocSchema.parse({
      id: branchId,
      tenantId,
      name: `${tenantName} - الفرع الرئيسي`,
      nameEn: `${tenantName} - Main Branch`,
      code: 'MAIN',
      isMain: true,
      city: 'الرياض',
      district: 'العليا',
      region: 'منطقة الرياض',
      country: 'SA',
      address: 'طريق الملك فهد',
      coordinates: { latitude: 24.7136, longitude: 46.6753 },
      phone: '+966500000000',
      isActive: true,
      operatingHours: DEFAULT_OPERATING_HOURS,
      internalNotes: 'الفرع الرئيسي التأسيسي للمنشأة',
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    const publicBranchData: PublicBranch = PublicBranchSchema.parse({
      id: branchId,
      name: branchDocData.name,
      nameEn: branchDocData.nameEn,
      isMain: true,
      city: branchDocData.city,
      district: branchDocData.district,
      region: branchDocData.region,
      country: branchDocData.country,
      address: branchDocData.address,
      coordinates: branchDocData.coordinates,
      phone: branchDocData.phone,
      operatingHours: branchDocData.operatingHours,
      isActive: true,
    });

    const batch = this.db.batch();
    batch.set(branchRef, branchDocData);
    batch.set(publicRef, publicBranchData);
    batch.set(pointerRef, {
      tenantId,
      mainBranchId: branchId,
      updatedAt: nowIso,
      version: 1,
    });
    await batch.commit();

    return branchDocData;
  }
}

