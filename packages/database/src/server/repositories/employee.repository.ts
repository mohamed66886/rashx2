import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  EmployeeDocSchema,
  CreateEmployeeInputSchema,
  UpdateEmployeeInputSchema,
  TerminationDetailsSchema,
  SafeEmployeeOwnerDtoSchema,
  SafeEmployeeManagerDtoSchema,
  SafeEmployeeStaffSelfDtoSchema,
  type EmployeeDoc,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type EmployeeStatus,
  type SafeEmployeeDto,
  type SafeEmployeeOwnerDto,
  type SafeEmployeeManagerDto,
  type SafeEmployeeStaffSelfDto,
} from '../../employee.schema';
import {
  HrAuditRecordSchema,
  type HrAuditRecord,
} from '../../hr-audit.schema';
import { BranchDocSchema } from '../../branch.schema';
import {
  canViewConfidentialHr,
  canTerminateEmployee,
  hasPermission,
  type TenantRole,
} from '../../permissions';

export interface EmployeeListOptions {
  search?: string;
  branchId?: string;
  status?: EmployeeStatus;
  jobTitle?: string;
  department?: string;
  limit?: number;
  offset?: number;
}

export class EmployeeRepository {
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
      entityType: 'EMPLOYEE',
      entityId,
      actorUid,
      details,
      timestamp: nowIso,
    });
    await this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)).set(record);
  }

  /**
   * Generates a unique employee number (e.g., EMP-001) for the tenant backed by an atomic counter.
   */
  async generateNextEmployeeNumber(tenantId: string): Promise<string> {
    const counterRef = this.db.doc(firestorePaths.tenantCounter(tenantId, 'employees'));
    return await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      let nextSeq = 1;
      if (snap.exists) {
        const data = snap.data();
        nextSeq = (typeof data?.lastSequence === 'number' ? data.lastSequence : 0) + 1;
      } else {
        const existingSnap = await this.db.collection(firestorePaths.employees(tenantId)).get();
        nextSeq = existingSnap.size + 1;
      }
      tx.set(
        counterRef,
        {
          id: 'employees',
          tenantId,
          lastSequence: nextSeq,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return `EMP-${String(nextSeq).padStart(3, '0')}`;
    });
  }

  /**
   * Validates that all branch IDs belong to the specified tenant.
   */
  private async validateBranches(tenantId: string, branchIds: string[]): Promise<void> {
    for (const branchId of branchIds) {
      const snap = await this.db.doc(firestorePaths.branch(tenantId, branchId)).get();
      if (!snap.exists) {
        throw new Error(`الفرع المحدد (${branchId}) غير موجود في هذه المنشأة.`);
      }
      const branch = BranchDocSchema.parse(snap.data());
      if (branch.tenantId !== tenantId) {
        throw new Error('محاولة تعيين فرع يتبع منشأة أخرى محظورة.');
      }
    }
  }

  /**
   * Creates a new Employee record scoped to the tenant with atomic counter sequence generation.
   */
  async createEmployee(
    tenantId: string,
    input: unknown,
    actorUid: string
  ): Promise<EmployeeDoc> {
    const parsed = CreateEmployeeInputSchema.parse(input);
    const nowIso = new Date().toISOString();

    // 1. Validate Branch IDs & Primary Branch
    await this.validateBranches(tenantId, parsed.assignedBranchIds);
    if (!parsed.assignedBranchIds.includes(parsed.primaryBranchId)) {
      throw new Error('الفرع الأساسي يجب أن يكون ضمن قائمة الفروع المعينة للموظف.');
    }

    // 2. Validate Linked User UID uniqueness if provided
    if (parsed.linkedUid) {
      const existingUidSnap = await this.db
        .collection(firestorePaths.employees(tenantId))
        .where('linkedUid', '==', parsed.linkedUid)
        .limit(1)
        .get();

      if (!existingUidSnap.empty) {
        throw new Error(`معرف المستخدم (${parsed.linkedUid}) مرتبط بالفعل بموظف آخر في هذه المنشأة.`);
      }
    }

    const employeeId = this.db.collection(firestorePaths.employees(tenantId)).doc().id;
    const empRef = this.db.doc(firestorePaths.employee(tenantId, employeeId));
    const counterRef = this.db.doc(firestorePaths.tenantCounter(tenantId, 'employees'));
    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;

    let finalEmployeeDoc!: EmployeeDoc;

    await this.db.runTransaction(async (tx) => {
      let employeeNumber = parsed.employeeNumber?.trim();
      if (!employeeNumber) {
        const counterSnap = await tx.get(counterRef);
        let nextSeq = 1;
        if (counterSnap.exists) {
          const data = counterSnap.data();
          nextSeq = (typeof data?.lastSequence === 'number' ? data.lastSequence : 0) + 1;
        } else {
          const existingSnap = await this.db.collection(firestorePaths.employees(tenantId)).get();
          nextSeq = existingSnap.size + 1;
        }
        tx.set(
          counterRef,
          {
            id: 'employees',
            tenantId,
            lastSequence: nextSeq,
            updatedAt: nowIso,
          },
          { merge: true }
        );
        employeeNumber = `EMP-${String(nextSeq).padStart(3, '0')}`;
      } else {
        const existingNumSnap = await this.db
          .collection(firestorePaths.employees(tenantId))
          .where('employeeNumber', '==', employeeNumber)
          .limit(1)
          .get();

        if (!existingNumSnap.empty) {
          throw new Error(`الرقم الوظيفي (${employeeNumber}) مسجل مسبقاً لموظف آخر.`);
        }
      }

      finalEmployeeDoc = EmployeeDocSchema.parse({
        ...parsed,
        id: employeeId,
        tenantId,
        employeeNumber,
        linkedUid: parsed.linkedUid || null,
        employmentStatus: 'ACTIVE',
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
        id: auditId,
        tenantId,
        action: 'EMPLOYEE_CREATED',
        entityType: 'EMPLOYEE',
        entityId: employeeId,
        actorUid,
        details: {
          employeeNumber: finalEmployeeDoc.employeeNumber,
          fullNameAr: finalEmployeeDoc.fullNameAr,
          jobTitle: finalEmployeeDoc.jobTitle,
          primaryBranchId: finalEmployeeDoc.primaryBranchId,
        },
        timestamp: nowIso,
      });

      tx.set(empRef, finalEmployeeDoc);
      tx.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    });

    return finalEmployeeDoc;
  }

  /**
   * Retrieves an Employee by ID.
   */
  async getEmployeeById(tenantId: string, employeeId: string): Promise<EmployeeDoc | null> {
    const snap = await this.db.doc(firestorePaths.employee(tenantId, employeeId)).get();
    if (!snap.exists) {
      return null;
    }
    const data = snap.data();
    if (data?.tenantId !== tenantId) {
      return null; // Tenant isolation guard
    }
    return EmployeeDocSchema.parse(data);
  }

  /**
   * Lists employees with filtering, searching, and pagination.
   */
  async listEmployees(
    tenantId: string,
    options?: EmployeeListOptions
  ): Promise<{ employees: EmployeeDoc[]; total: number }> {
    const snap = await this.db.collection(firestorePaths.employees(tenantId)).get();
    let allEmployees = snap.docs
      .map((d) => EmployeeDocSchema.parse(d.data()))
      .filter((e) => e.tenantId === tenantId);

    // Filter by branch
    if (options?.branchId) {
      allEmployees = allEmployees.filter((e) => e.assignedBranchIds.includes(options.branchId!));
    }

    // Filter by status
    if (options?.status) {
      allEmployees = allEmployees.filter((e) => e.employmentStatus === options.status);
    }

    // Filter by job title
    if (options?.jobTitle) {
      allEmployees = allEmployees.filter((e) => e.jobTitle.toLowerCase().includes(options.jobTitle!.toLowerCase()));
    }

    // Filter by department
    if (options?.department) {
      allEmployees = allEmployees.filter((e) => e.department?.toLowerCase() === options.department!.toLowerCase());
    }

    // Search query
    if (options?.search) {
      const q = options.search.trim().toLowerCase();
      allEmployees = allEmployees.filter(
        (e) =>
          e.fullNameAr.toLowerCase().includes(q) ||
          e.fullNameEn?.toLowerCase().includes(q) ||
          e.employeeNumber.toLowerCase().includes(q) ||
          e.phone.includes(q)
      );
    }

    // Sort by createdAt desc
    allEmployees.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const total = allEmployees.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paginated = allEmployees.slice(offset, offset + limit);

    return { employees: paginated, total };
  }

  /**
   * Updates an existing Employee record.
   */
  async updateEmployee(
    tenantId: string,
    employeeId: string,
    input: unknown,
    actorUid: string
  ): Promise<EmployeeDoc> {
    const current = await this.getEmployeeById(tenantId, employeeId);
    if (!current) {
      throw new Error(`الموظف المطلوب (${employeeId}) غير موجود.`);
    }

    const parsed = UpdateEmployeeInputSchema.parse(input);
    const nowIso = new Date().toISOString();

    // Safeguard: do not overwrite real nationalId with a masked string containing asterisks
    if (parsed.nationalId && parsed.nationalId.includes('*')) {
      delete parsed.nationalId;
    }

    // Validate branches if changed
    if (parsed.assignedBranchIds) {
      await this.validateBranches(tenantId, parsed.assignedBranchIds);
      const primary = parsed.primaryBranchId || current.primaryBranchId;
      if (!parsed.assignedBranchIds.includes(primary)) {
        throw new Error('الفرع الأساسي يجب أن يكون ضمن قائمة الفروع المعينة للموظف.');
      }
    }

    // Validate employee number uniqueness if changed
    if (parsed.employeeNumber && parsed.employeeNumber !== current.employeeNumber) {
      const existingNumSnap = await this.db
        .collection(firestorePaths.employees(tenantId))
        .where('employeeNumber', '==', parsed.employeeNumber)
        .limit(1)
        .get();

      if (!existingNumSnap.empty && existingNumSnap.docs[0]?.id !== employeeId) {
        throw new Error(`الرقم الوظيفي (${parsed.employeeNumber}) مسجل مسبقاً لموظف آخر.`);
      }
    }

    // Validate linked UID uniqueness if changed
    if (parsed.linkedUid && parsed.linkedUid !== current.linkedUid) {
      const existingUidSnap = await this.db
        .collection(firestorePaths.employees(tenantId))
        .where('linkedUid', '==', parsed.linkedUid)
        .limit(1)
        .get();

      if (!existingUidSnap.empty && existingUidSnap.docs[0]?.id !== employeeId) {
        throw new Error(`معرف المستخدم (${parsed.linkedUid}) مرتبط بالفعل بموظف آخر في هذه المنشأة.`);
      }
    }

    const updated: EmployeeDoc = EmployeeDocSchema.parse({
      ...current,
      ...parsed,
      id: employeeId,
      tenantId,
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'EMPLOYEE_UPDATED',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      actorUid,
      details: {
        updatedFields: Object.keys(parsed),
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.employee(tenantId, employeeId)), updated);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return updated;
  }

  /**
   * Terminates an employee with an explicit reason and effective date.
   * Atomically terminates the employee, deactivates associated service provider and public projection,
   * and records an immutable HR audit trail in a single batch.
   */
  async terminateEmployee(
    tenantId: string,
    employeeId: string,
    termination: { reason: string; effectiveDate: string; notes?: string },
    actorUid: string
  ): Promise<EmployeeDoc> {
    const current = await this.getEmployeeById(tenantId, employeeId);
    if (!current) {
      throw new Error(`الموظف المطلوب (${employeeId}) غير موجود.`);
    }

    if (current.employmentStatus === 'TERMINATED') {
      throw new Error('الموظف في حالة إنهاء خدمة مسبقاً.');
    }

    const terminationDetails = TerminationDetailsSchema.parse({
      ...termination,
      terminatedByUid: actorUid,
    });

    const nowIso = new Date().toISOString();
    const updated: EmployeeDoc = EmployeeDocSchema.parse({
      ...current,
      employmentStatus: 'TERMINATED',
      terminationDetails,
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'EMPLOYEE_TERMINATED',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      actorUid,
      details: {
        reason: termination.reason,
        effectiveDate: termination.effectiveDate,
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.employee(tenantId, employeeId)), updated);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);

    // If employee was a provider, atomically deactivate provider and hide public projection
    if (current.isProvider) {
      const provSnap = await this.db
        .collection(firestorePaths.providers(tenantId))
        .where('employeeId', '==', employeeId)
        .limit(1)
        .get();

      if (!provSnap.empty && provSnap.docs[0]) {
        const provDoc = provSnap.docs[0];
        const provRef = provDoc.ref;
        batch.update(provRef, { status: 'INACTIVE', isPubliclyVisible: false, updatedAt: nowIso });
        batch.update(this.db.doc(firestorePaths.publicProvider(tenantId, provDoc.id)), {
          isPubliclyVisible: false,
          updatedAt: nowIso,
        });
      }
    }

    await batch.commit();

    return updated;
  }

  /**
   * Updates an employee's operational status (ACTIVE, INACTIVE, ON_LEAVE, SUSPENDED).
   * Atomically persists status change, synchronizes provider visibility, and logs HR audit.
   */
  async setEmployeeStatus(
    tenantId: string,
    employeeId: string,
    status: EmployeeStatus,
    actorUid: string,
    reason?: string
  ): Promise<EmployeeDoc> {
    const current = await this.getEmployeeById(tenantId, employeeId);
    if (!current) {
      throw new Error(`الموظف المطلوب (${employeeId}) غير موجود.`);
    }

    if (status === 'TERMINATED') {
      throw new Error('لإنهاء خدمة الموظف، يرجى استخدام مسار إنهاء الخدمة مع توثيق السبب وتاريخ السريان.');
    }

    const nowIso = new Date().toISOString();
    const updated: EmployeeDoc = EmployeeDocSchema.parse({
      ...current,
      employmentStatus: status,
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'EMPLOYEE_STATUS_CHANGED',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      actorUid,
      details: {
        oldStatus: current.employmentStatus,
        newStatus: status,
        reason,
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.employee(tenantId, employeeId)), updated);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);

    // If employee is deactivated or suspended, atomically hide public provider projection
    if (status !== 'ACTIVE' && current.isProvider) {
      const provSnap = await this.db
        .collection(firestorePaths.providers(tenantId))
        .where('employeeId', '==', employeeId)
        .limit(1)
        .get();

      if (!provSnap.empty && provSnap.docs[0]) {
        const provDoc = provSnap.docs[0];
        batch.update(this.db.doc(firestorePaths.publicProvider(tenantId, provDoc.id)), {
          isPubliclyVisible: false,
          updatedAt: nowIso,
        });
      }
    }

    await batch.commit();

    return updated;
  }

  /**
   * Links an existing authenticated user UID to an Employee.
   */
  async linkUser(
    tenantId: string,
    employeeId: string,
    uid: string,
    actorUid: string
  ): Promise<EmployeeDoc> {
    const current = await this.getEmployeeById(tenantId, employeeId);
    if (!current) {
      throw new Error(`الموظف المطلوب (${employeeId}) غير موجود.`);
    }

    // Check if another employee in this tenant is already linked to this UID
    const existingSnap = await this.db
      .collection(firestorePaths.employees(tenantId))
      .where('linkedUid', '==', uid)
      .limit(1)
      .get();

    if (!existingSnap.empty && existingSnap.docs[0]?.id !== employeeId) {
      throw new Error(`معرف الحساب (${uid}) مرتبط بالفعل بموظف آخر في هذه المنشأة.`);
    }

    const nowIso = new Date().toISOString();
    const updated: EmployeeDoc = EmployeeDocSchema.parse({
      ...current,
      linkedUid: uid,
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'USER_LINKED',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      actorUid,
      details: {
        linkedUid: uid,
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.employee(tenantId, employeeId)), updated);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return updated;
  }

  /**
   * Unlinks a user account UID from an Employee profile.
   */
  async unlinkUser(
    tenantId: string,
    employeeId: string,
    actorUid: string
  ): Promise<EmployeeDoc> {
    const current = await this.getEmployeeById(tenantId, employeeId);
    if (!current) {
      throw new Error(`الموظف المطلوب (${employeeId}) غير موجود.`);
    }

    const nowIso = new Date().toISOString();
    const updated: EmployeeDoc = EmployeeDocSchema.parse({
      ...current,
      linkedUid: null,
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'USER_UNLINKED',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      actorUid,
      details: {
        unlinkedUid: current.linkedUid,
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.employee(tenantId, employeeId)), updated);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return updated;
  }

  /**
   * Masks a National ID string (e.g. 1092345632 -> 109*****32).
   */
  private maskNationalId(nationalId?: string): string | undefined {
    if (!nationalId) return undefined;
    if (nationalId.includes('*')) return nationalId;
    return nationalId.length > 4
      ? nationalId.slice(0, 3) + '*'.repeat(Math.max(3, nationalId.length - 5)) + nationalId.slice(-2)
      : '***';
  }

  /**
   * Phase 2.3: Projects an employee document to the strictly typed safe DTO based on
   * the actor's verified role and session identity.
   * Prevents raw Firestore snapshot leakage.
   */
  projectSafeEmployee(
    employee: EmployeeDoc,
    actorRole: TenantRole,
    actorUid: string,
    customPermissions?: readonly string[] | null
  ): SafeEmployeeDto {
    const isSelf = Boolean(employee.linkedUid && employee.linkedUid === actorUid);

    // 1. STAFF Role
    if (actorRole === 'STAFF') {
      if (!isSelf) {
        throw new Error('غير مصرح: لا تملك صلاحية الاطلاع على ملفات الموظفين الآخرين.');
      }
      return SafeEmployeeStaffSelfDtoSchema.parse({
        id: employee.id,
        tenantId: employee.tenantId,
        linkedUid: employee.linkedUid,
        employeeNumber: employee.employeeNumber,
        fullNameAr: employee.fullNameAr,
        fullNameEn: employee.fullNameEn,
        phone: employee.phone,
        email: employee.email,
        photoUrl: employee.photoUrl,
        nationality: employee.nationality,
        nationalId: this.maskNationalId(employee.nationalId),
        jobTitle: employee.jobTitle,
        department: employee.department,
        employmentType: employee.employmentType,
        employmentStatus: employee.employmentStatus,
        hireDate: employee.hireDate,
        primaryBranchId: employee.primaryBranchId,
        assignedBranchIds: employee.assignedBranchIds,
        isProvider: employee.isProvider,
        emergencyContact: employee.emergencyContact,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      });
    }

    // 2. OWNER or explicitly authorized HR role (Full unmasked HR access)
    if (canViewConfidentialHr(actorRole, customPermissions)) {
      return SafeEmployeeOwnerDtoSchema.parse({
        id: employee.id,
        tenantId: employee.tenantId,
        linkedUid: employee.linkedUid,
        employeeNumber: employee.employeeNumber,
        fullNameAr: employee.fullNameAr,
        fullNameEn: employee.fullNameEn,
        phone: employee.phone,
        email: employee.email,
        photoUrl: employee.photoUrl,
        nationality: employee.nationality,
        nationalId: employee.nationalId, // Unmasked for owner
        jobTitle: employee.jobTitle,
        department: employee.department,
        employmentType: employee.employmentType,
        employmentStatus: employee.employmentStatus,
        hireDate: employee.hireDate,
        contractStartDate: employee.contractStartDate,
        contractEndDate: employee.contractEndDate,
        primaryBranchId: employee.primaryBranchId,
        assignedBranchIds: employee.assignedBranchIds,
        isProvider: employee.isProvider,
        emergencyContact: employee.emergencyContact,
        internalNotes: employee.internalNotes,
        terminationDetails: employee.terminationDetails,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      });
    }

    // 3. MANAGER Role (Operational scope without confidential HR grant)
    const hasNotesPermission =
      hasPermission(actorRole, 'employees.manage_notes' as any, customPermissions) ||
      canViewConfidentialHr(actorRole, customPermissions);
    const hasTerminatePermission = canTerminateEmployee(actorRole, customPermissions);

    return SafeEmployeeManagerDtoSchema.parse({
      id: employee.id,
      tenantId: employee.tenantId,
      linkedUid: employee.linkedUid,
      employeeNumber: employee.employeeNumber,
      fullNameAr: employee.fullNameAr,
      fullNameEn: employee.fullNameEn,
      phone: employee.phone,
      email: employee.email,
      photoUrl: employee.photoUrl,
      nationality: employee.nationality,
      nationalId: this.maskNationalId(employee.nationalId),
      jobTitle: employee.jobTitle,
      department: employee.department,
      employmentType: employee.employmentType,
      employmentStatus: employee.employmentStatus,
      hireDate: employee.hireDate,
      contractStartDate: employee.contractStartDate,
      contractEndDate: employee.contractEndDate,
      primaryBranchId: employee.primaryBranchId,
      assignedBranchIds: employee.assignedBranchIds,
      isProvider: employee.isProvider,
      emergencyContact: employee.emergencyContact,
      internalNotes: hasNotesPermission ? employee.internalNotes : undefined,
      terminationDetails: hasTerminatePermission ? employee.terminationDetails : undefined,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    });
  }

  /**
   * Phase 2.3: Retrieves the current authenticated user's own employee profile in the tenant.
   * Authoritatively matches linkedUid == actorUid.
   */
  async getCurrentEmployeeProfile(
    tenantId: string,
    actorUid: string,
    actorRole: TenantRole = 'STAFF'
  ): Promise<SafeEmployeeDto | null> {
    const snap = await this.db
      .collection(firestorePaths.employees(tenantId))
      .where('linkedUid', '==', actorUid)
      .limit(1)
      .get();

    if (snap.empty) {
      return null;
    }

    const employee = EmployeeDocSchema.parse(snap.docs[0]!.data());
    if (employee.tenantId !== tenantId) {
      return null;
    }

    return this.projectSafeEmployee(employee, actorRole, actorUid);
  }

  /**
   * Phase 2.3: Safely retrieves an employee document with strict field-level masking
   * and role-based DTO projection.
   * Prevents unauthorized staff or peers from reading confidential personal data.
   */
  async getEmployeeByIdSafe(
    tenantId: string,
    employeeId: string,
    actorRole: TenantRole,
    actorUid: string,
    customPermissions?: readonly string[] | null
  ): Promise<SafeEmployeeDto | null> {
    const emp = await this.getEmployeeById(tenantId, employeeId);
    if (!emp) return null;

    return this.projectSafeEmployee(emp, actorRole, actorUid, customPermissions);
  }

  /**
   * Phase 2.3: Retrieves operational management data for managers.
   */
  async getEmployeeOperationalInfo(
    tenantId: string,
    employeeId: string,
    actorRole: TenantRole,
    customPermissions?: readonly string[] | null
  ): Promise<SafeEmployeeManagerDto | null> {
    if (actorRole === 'STAFF') {
      throw new Error('غير مصرح: لا تملك صلاحية الاطلاع على المعلومات التشغيلية للموظفين.');
    }
    const emp = await this.getEmployeeById(tenantId, employeeId);
    if (!emp) return null;

    const projected = this.projectSafeEmployee(emp, actorRole, '', customPermissions);
    return SafeEmployeeManagerDtoSchema.parse(projected);
  }

  /**
   * Phase 2.3: Retrieves confidential HR data strictly for tenant owners or authorized HR admins.
   */
  async getEmployeeConfidentialHr(
    tenantId: string,
    employeeId: string,
    actorRole: TenantRole,
    customPermissions?: readonly string[] | null
  ): Promise<SafeEmployeeOwnerDto | null> {
    if (!canViewConfidentialHr(actorRole, customPermissions)) {
      throw new Error('غير مصرح: هذه البيانات محصورة بمالك المنشأة ومسؤولي الموارد البشرية المصرح لهم.');
    }
    const emp = await this.getEmployeeById(tenantId, employeeId);
    if (!emp) return null;

    return SafeEmployeeOwnerDtoSchema.parse(emp);
  }

  /**
   * Backward-compatible alias for getEmployeeByIdSafe.
   */
  async getEmployeeSafe(
    tenantId: string,
    employeeId: string,
    actorRole: TenantRole,
    actorUid: string,
    customPermissions?: readonly string[] | null
  ): Promise<SafeEmployeeDto | null> {
    return this.getEmployeeByIdSafe(tenantId, employeeId, actorRole, actorUid, customPermissions);
  }

  /**
   * Legacy masking helper preserved for internal repository compatibility.
   */
  maskSensitiveData(
    employee: EmployeeDoc,
    actorRole?: TenantRole,
    actorUid?: string,
    customPermissions?: readonly string[] | null
  ): EmployeeDoc {
    if (!actorRole) return employee;
    if (canViewConfidentialHr(actorRole, customPermissions)) {
      return employee;
    }

    const isSelf = Boolean(employee.linkedUid && employee.linkedUid === actorUid);
    if (actorRole === 'STAFF') {
      if (!isSelf) {
        throw new Error('غير مصرح: لا تملك صلاحية الاطلاع على ملفات الموظفين الآخرين.');
      }
      return EmployeeDocSchema.parse({
        ...employee,
        nationalId: this.maskNationalId(employee.nationalId),
        internalNotes: undefined,
        terminationDetails: undefined,
      });
    }

    return EmployeeDocSchema.parse({
      ...employee,
      nationalId: this.maskNationalId(employee.nationalId),
    });
  }

  /**
   * Safely lists employee documents with field masking and RBAC checks.
   * Returns safe DTO projections. Denies STAFF listing.
   */
  async listEmployeesSafe(
    tenantId: string,
    options: EmployeeListOptions,
    actorRole: TenantRole,
    actorUid: string,
    customPermissions?: readonly string[] | null
  ): Promise<{ employees: SafeEmployeeDto[]; total: number }> {
    if (actorRole === 'STAFF') {
      throw new Error('غير مصرح: لا تملك صلاحية استعراض سجل الموظفين.');
    }

    const result = await this.listEmployees(tenantId, options);
    const safeEmployees = result.employees.map((e) =>
      this.projectSafeEmployee(e, actorRole, actorUid, customPermissions)
    );
    return { employees: safeEmployees, total: result.total };
  }
}

