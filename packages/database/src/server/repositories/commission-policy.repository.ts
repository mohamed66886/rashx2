import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  CommissionPolicyDocSchema,
  CreateCommissionPolicyInputSchema,
  UpdateCommissionPolicyInputSchema,
  type CommissionPolicyDoc,
  type CommissionPolicyType,
} from '../../commission-policy.schema';
import { HrAuditRecordSchema, type HrAuditRecord } from '../../hr-audit.schema';

export class CommissionPolicyRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  private async logHrAudit(
    tenantId: string,
    action: HrAuditRecord['action'],
    entityId: string,
    actorUid: string,
    details: Record<string, unknown>
  ): Promise<void> {
    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const nowIso = new Date().toISOString();
    const record: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action,
      entityType: 'COMMISSION_POLICY',
      entityId,
      actorUid,
      details,
      timestamp: nowIso,
    });
    await this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)).set(record);
  }

  async createPolicy(
    tenantId: string,
    input: unknown,
    actorUid: string
  ): Promise<CommissionPolicyDoc> {
    const parsed = CreateCommissionPolicyInputSchema.parse(input);
    const nowIso = new Date().toISOString();

    if (parsed.effectiveUntil && parsed.effectiveUntil < parsed.effectiveFrom) {
      throw new Error('تاريخ انتهاء السريان لا يمكن أن يكون قبل تاريخ بدء السريان.');
    }

    const policyId = this.db.collection(firestorePaths.commissionPolicies(tenantId)).doc().id;

    const policyDoc: CommissionPolicyDoc = CommissionPolicyDocSchema.parse({
      ...parsed,
      id: policyId,
      tenantId,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'COMMISSION_POLICY_CREATED',
      entityType: 'COMMISSION_POLICY',
      entityId: policyId,
      actorUid,
      details: {
        nameAr: policyDoc.nameAr,
        type: policyDoc.type,
        basis: policyDoc.basis,
      },
      timestamp: nowIso,
    });

    // Write policy doc and HR audit trail atomically in one batch
    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.commissionPolicy(tenantId, policyId)), policyDoc);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return policyDoc;
  }

  async getPolicyById(tenantId: string, policyId: string): Promise<CommissionPolicyDoc | null> {
    const snap = await this.db.doc(firestorePaths.commissionPolicy(tenantId, policyId)).get();
    if (!snap.exists) {
      return null;
    }
    const data = snap.data();
    if (data?.tenantId !== tenantId) {
      return null;
    }
    return CommissionPolicyDocSchema.parse(data);
  }

  async listPolicies(
    tenantId: string,
    options?: { type?: CommissionPolicyType; isActive?: boolean }
  ): Promise<CommissionPolicyDoc[]> {
    const snap = await this.db.collection(firestorePaths.commissionPolicies(tenantId)).get();
    let policies = snap.docs
      .map((d) => CommissionPolicyDocSchema.parse(d.data()))
      .filter((p) => p.tenantId === tenantId);

    if (options?.type) {
      policies = policies.filter((p) => p.type === options.type);
    }

    if (options?.isActive !== undefined) {
      policies = policies.filter((p) => p.isActive === options.isActive);
    }

    policies.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return policies;
  }

  async updatePolicy(
    tenantId: string,
    policyId: string,
    input: unknown,
    actorUid: string
  ): Promise<CommissionPolicyDoc> {
    const current = await this.getPolicyById(tenantId, policyId);
    if (!current) {
      throw new Error(`سياسة العمولة المطلوبة (${policyId}) غير موجودة.`);
    }

    const parsed = UpdateCommissionPolicyInputSchema.parse(input);
    const nowIso = new Date().toISOString();

    const effectiveFrom = current.effectiveFrom;
    const effectiveUntil = parsed.effectiveUntil !== undefined ? parsed.effectiveUntil : current.effectiveUntil;
    if (effectiveUntil && effectiveUntil < effectiveFrom) {
      throw new Error('تاريخ انتهاء السريان لا يمكن أن يكون قبل تاريخ بدء السريان.');
    }

    const updated: CommissionPolicyDoc = CommissionPolicyDocSchema.parse({
      ...current,
      ...parsed,
      id: policyId,
      tenantId,
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'COMMISSION_POLICY_UPDATED',
      entityType: 'COMMISSION_POLICY',
      entityId: policyId,
      actorUid,
      details: {
        updatedFields: Object.keys(parsed),
      },
      timestamp: nowIso,
    });

    // Write updated policy doc and HR audit trail atomically in one batch
    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.commissionPolicy(tenantId, policyId)), updated);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return updated;
  }
}

