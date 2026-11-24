import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  CompensationRecordDocSchema,
  CreateCompensationInputSchema,
  type CompensationRecordDoc,
  type CreateCompensationInput,
} from '../../compensation.schema';
import { EmployeeDocSchema } from '../../employee.schema';
import {
  canViewCompensation,
  canManageCompensation,
  type TenantRole,
} from '../../permissions';
import { HrAuditRecordSchema, type HrAuditRecord } from '../../hr-audit.schema';

export class CompensationRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  /**
   * Helper to write an immutable HR audit record.
   */
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
      entityType: 'COMPENSATION',
      entityId,
      actorUid,
      details,
      timestamp: nowIso,
    });
    await this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)).set(record);
  }

  /**
   * Calculates the previous day string (YYYY-MM-DD) for clean contract transitions using UTC.
   */
  private getPreviousDay(dateStr: string): string {
    const parts = dateStr.split('-').map(Number);
    const year = parts[0]!;
    const month = parts[1]!;
    const day = parts[2]!;
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0]!;
  }

  /**
   * Creates an effective-dated compensation record for an employee.
   * Atomically supersedes previous active compensation without modifying past payroll data.
   * Strictly restricted to OWNER or authorized HR roles.
   */
  async createCompensation(
    tenantId: string,
    employeeId: string,
    input: unknown,
    actorRole: TenantRole,
    actorUid: string,
    customPermissions?: readonly string[] | null
  ): Promise<CompensationRecordDoc> {
    if (!canManageCompensation(actorRole, customPermissions)) {
      throw new Error('غير مصرح: لا تملك الصلاحية لإدارة البيانات المالية وهياكل الأجور للموظفين.');
    }

    const parsed = CreateCompensationInputSchema.parse(input);
    const nowIso = new Date().toISOString();

    // 1. Validate date logic (no inverted date ranges)
    if (parsed.effectiveEndDate && parsed.effectiveEndDate < parsed.effectiveStartDate) {
      throw new Error('تاريخ انتهاء السريان لا يمكن أن يكون قبل تاريخ بدء السريان.');
    }

    // 2. Verify employee exists in tenant
    const empSnap = await this.db.doc(firestorePaths.employee(tenantId, employeeId)).get();
    if (!empSnap.exists) {
      throw new Error(`الموظف المطلوب (${employeeId}) غير موجود في هذه المنشأة.`);
    }
    const emp = EmployeeDocSchema.parse(empSnap.data());
    if (emp.tenantId !== tenantId) {
      throw new Error('محاولة تعديل بيانات موظف من منشأة أخرى محظورة.');
    }

    const compId = this.db.collection(firestorePaths.compensations(tenantId, employeeId)).doc().id;
    const compRef = this.db.doc(firestorePaths.compensation(tenantId, employeeId, compId));
    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;

    const newRecord: CompensationRecordDoc = CompensationRecordDocSchema.parse({
      ...parsed,
      id: compId,
      tenantId,
      employeeId,
      status: 'ACTIVE',
      createdByUid: actorUid,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    const newStart = parsed.effectiveStartDate;
    const newEnd = parsed.effectiveEndDate || null;

    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'COMPENSATION_CREATED',
      entityType: 'COMPENSATION',
      entityId: compId,
      actorUid,
      details: {
        employeeId,
        modelType: newRecord.modelType,
        effectiveStartDate: newRecord.effectiveStartDate,
        effectiveEndDate: newRecord.effectiveEndDate,
      },
      timestamp: nowIso,
    });

    await this.db.runTransaction(async (transaction) => {
      // Find all existing active compensation contracts for this employee
      const existingSnap = await transaction.get(
        this.db
          .collection(firestorePaths.compensations(tenantId, employeeId))
          .where('status', '==', 'ACTIVE')
      );

      for (const doc of existingSnap.docs) {
        const prev = CompensationRecordDocSchema.parse(doc.data());
        const prevStart = prev.effectiveStartDate;
        const prevEnd = prev.effectiveEndDate || null;

        // Case 1: Existing contract is open-ended
        if (!prevEnd) {
          if (newStart <= prevStart) {
            throw new Error(
              `العقد الجديد يتعارض مع العقد الساري القائم الذي يبدأ في ${prevStart}.`
            );
          }
          // Valid forward progression: cleanly close the open-ended contract at previous day
          const previousDay = this.getPreviousDay(newStart);
          const resolvedEndDate = prevStart < previousDay ? previousDay : prevStart;
          transaction.update(doc.ref, {
            status: 'SUPERSEDED',
            effectiveEndDate: resolvedEndDate,
            updatedAt: nowIso,
          });
        } else {
          // Case 2: Existing contract has a fixed date interval [prevStart, prevEnd]
          // Test for inclusive calendar overlap:
          // Overlap occurs if newStart <= prevEnd AND (newEnd is open OR newEnd >= prevStart)
          const isOverlapping = newStart <= prevEnd && (!newEnd || newEnd >= prevStart);
          if (isOverlapping) {
            throw new Error(
              `العقد الجديد يتعارض مع فترة العقد الساري القائم [${prevStart} إلى ${prevEnd}].`
            );
          }
        }
      }

      transaction.set(compRef, newRecord);
      transaction.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    });

    return newRecord;
  }

  /**
   * Lists complete historical compensation contracts for an employee.
   * Strictly restricted to OWNER or authorized HR roles.
   */
  async listCompensationHistory(
    tenantId: string,
    employeeId: string,
    actorRole: TenantRole,
    customPermissions?: readonly string[] | null
  ): Promise<CompensationRecordDoc[]> {
    if (!canViewCompensation(actorRole, customPermissions)) {
      throw new Error('غير مصرح: لا تملك الصلاحية للاطلاع على السجلات المالية والأجور.');
    }

    const snap = await this.db
      .collection(firestorePaths.compensations(tenantId, employeeId))
      .get();

    const records = snap.docs
      .map((d) => CompensationRecordDocSchema.parse(d.data()))
      .filter((c) => c.tenantId === tenantId && c.employeeId === employeeId);

    // Sort by effectiveStartDate descending
    records.sort((a, b) => b.effectiveStartDate.localeCompare(a.effectiveStartDate));

    return records;
  }

  /**
   * Retrieves the current active compensation structure for an employee.
   * Strictly restricted to OWNER or authorized HR roles.
   */
  async getActiveCompensation(
    tenantId: string,
    employeeId: string,
    actorRole: TenantRole,
    customPermissions?: readonly string[] | null
  ): Promise<CompensationRecordDoc | null> {
    if (!canViewCompensation(actorRole, customPermissions)) {
      throw new Error('غير مصرح: لا تملك الصلاحية للاطلاع على السجلات المالية والأجور.');
    }

    const snap = await this.db
      .collection(firestorePaths.compensations(tenantId, employeeId))
      .where('status', '==', 'ACTIVE')
      .limit(1)
      .get();

    if (snap.empty || !snap.docs[0]) {
      return null;
    }
    return CompensationRecordDocSchema.parse(snap.docs[0].data());
  }
}

