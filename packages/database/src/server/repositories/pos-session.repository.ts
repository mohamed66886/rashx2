import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import { hasPermission, type TenantRole } from '../../permissions';
import { BranchDocSchema } from '../../branch.schema';
import {
  CashMovementDocSchema,
  DEFAULT_PAYMENT_METHOD_CONFIGS,
  PaymentMethodCodeEnum,
  PaymentMethodConfigDocSchema,
  PosAuditDocSchema,
  PosSessionDocSchema,
  calculateExpectedCashHalalas,
  type CashMovementDoc,
  type PaymentMethodCode,
  type PaymentMethodConfigDoc,
  type PosSessionDoc,
} from '../../pos.schema';
import { TrustedSystemContext } from './trusted-context';

export enum PosSessionErrorCode {
  FORBIDDEN = 'POS_SESSION_FORBIDDEN',
  BRANCH_FORBIDDEN = 'POS_SESSION_BRANCH_FORBIDDEN',
  BRANCH_NOT_FOUND = 'POS_SESSION_BRANCH_NOT_FOUND',
  SESSION_NOT_FOUND = 'POS_SESSION_NOT_FOUND',
  SESSION_ALREADY_OPEN = 'POS_SESSION_ALREADY_OPEN',
  SESSION_NOT_OPEN = 'POS_SESSION_NOT_OPEN',
  INVALID_PAYLOAD = 'POS_SESSION_INVALID_PAYLOAD',
}

export class PosSessionError extends Error {
  constructor(
    public readonly code: PosSessionErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PosSessionError';
  }
}

export type PosActor =
  | {
      uid: string;
      role: TenantRole;
      customPermissions?: readonly string[] | null;
      assignedBranchIds?: readonly string[] | null;
      isPlatformAdmin?: boolean;
    }
  | TrustedSystemContext;

export class PosSessionRepository {
  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {}

  private getActorUid(actor: PosActor): string {
    return TrustedSystemContext.isTrusted(actor) ? 'SYSTEM' : actor.uid;
  }

  private verifyPermission(
    actor: PosActor,
    capability: Parameters<typeof hasPermission>[1]
  ): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (!hasPermission(actor.role, capability, actor.customPermissions)) {
      throw new PosSessionError(
        PosSessionErrorCode.FORBIDDEN,
        `غير مصرح: تفتقر إلى الصلاحية المطلوبة (${capability}).`
      );
    }
  }

  private verifyBranchAccess(actor: PosActor, branchId: string): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin || actor.role === 'OWNER') return;
    if (actor.assignedBranchIds && actor.assignedBranchIds.length > 0) {
      if (!actor.assignedBranchIds.includes(branchId)) {
        throw new PosSessionError(
          PosSessionErrorCode.BRANCH_FORBIDDEN,
          'غير مصرح: لا تملك صلاحية الوصول إلى هذا الفرع.'
        );
      }
    }
  }

  async openSession(
    actor: PosActor,
    input: {
      tenantId: string;
      branchId: string;
      cashierName: string;
      openingCashHalalas: number;
      notes?: string;
    }
  ): Promise<PosSessionDoc> {
    this.verifyPermission(actor, 'pos_sessions.open');
    this.verifyBranchAccess(actor, input.branchId);

    if (!Number.isInteger(input.openingCashHalalas) || input.openingCashHalalas < 0) {
      throw new PosSessionError(
        PosSessionErrorCode.INVALID_PAYLOAD,
        'الرصيد الافتتاحي للصندوق يجب أن يكون رقماً صحيحاً غير سالب بالهللات.'
      );
    }

    const actorUid = this.getActorUid(actor);
    const lockId = `${input.branchId}_${actorUid}`;
    const lockRef = this.firestore.doc(firestorePaths.posActiveSessionLock(input.tenantId, lockId));
    const branchRef = this.firestore.doc(firestorePaths.branch(input.tenantId, input.branchId));
    const sessionRef = this.firestore.collection(firestorePaths.posSessions(input.tenantId)).doc();
    const movementRef = this.firestore.collection(firestorePaths.posCashMovements(input.tenantId)).doc();
    const auditRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();

    return await this.firestore.runTransaction(async (transaction) => {
      const [branchSnap, lockSnap] = await Promise.all([
        transaction.get(branchRef),
        transaction.get(lockRef),
      ]);

      if (!branchSnap.exists) {
        throw new PosSessionError(PosSessionErrorCode.BRANCH_NOT_FOUND, 'الفرع غير موجود.');
      }
      const branch = BranchDocSchema.parse(branchSnap.data());

      if (lockSnap.exists && lockSnap.data()?.status === 'OPEN') {
        throw new PosSessionError(
          PosSessionErrorCode.SESSION_ALREADY_OPEN,
          'يوجد بالفعل جلسة صندوق مفتوحة لك في هذا الفرع. يرجى إغلاقها أولاً.'
        );
      }

      const nowIso = new Date().toISOString();
      const sessionDoc = PosSessionDocSchema.parse({
        id: sessionRef.id,
        tenantId: input.tenantId,
        branchId: input.branchId,
        branchName: branch.name,
        cashierUid: actorUid,
        cashierName: input.cashierName || actorUid,
        status: 'OPEN',
        openingCashHalalas: input.openingCashHalalas,
        cashSalesHalalas: 0,
        cashRefundsHalalas: 0,
        cashInHalalas: 0,
        cashOutHalalas: 0,
        nonCashSalesHalalas: 0,
        nonCashRefundsHalalas: 0,
        expectedCashHalalas: input.openingCashHalalas,
        actualCountedCashHalalas: null,
        cashDifferenceHalalas: null,
        openedAt: nowIso,
        openedBy: actorUid,
        closingStartedAt: null,
        closingBy: null,
        closedAt: null,
        closedBy: null,
        notes: input.notes || '',
        updatedAt: nowIso,
      });

      transaction.set(sessionRef, sessionDoc);
      transaction.set(lockRef, {
        id: lockId,
        tenantId: input.tenantId,
        branchId: input.branchId,
        cashierUid: actorUid,
        sessionId: sessionRef.id,
        status: 'OPEN',
        updatedAt: nowIso,
      });

      if (input.openingCashHalalas > 0) {
        const moveDoc = CashMovementDocSchema.parse({
          id: movementRef.id,
          tenantId: input.tenantId,
          branchId: input.branchId,
          sessionId: sessionRef.id,
          type: 'OPENING_FLOAT',
          amountHalalas: input.openingCashHalalas,
          referenceId: sessionRef.id,
          reason: 'رصيد افتتاحي للوردية',
          idempotencyKey: `opening_${sessionRef.id}`,
          actorUid,
          createdAt: nowIso,
        });
        transaction.set(movementRef, moveDoc);
      }

      const auditDoc = PosAuditDocSchema.parse({
        id: auditRef.id,
        tenantId: input.tenantId,
        branchId: input.branchId,
        action: 'CASH_SESSION_OPENED',
        entityType: 'POS_SESSION',
        entityId: sessionRef.id,
        actorUid,
        idempotencyKey: null,
        details: {
          openingCashHalalas: input.openingCashHalalas,
          branchName: branch.name,
        },
        timestamp: nowIso,
      });
      transaction.set(auditRef, auditDoc);

      return sessionDoc;
    });
  }

  async recordCashMovement(
    actor: PosActor,
    input: {
      tenantId: string;
      sessionId: string;
      type: 'CASH_IN' | 'CASH_OUT';
      amountHalalas: number;
      reason: string;
      idempotencyKey: string;
    }
  ): Promise<{ session: PosSessionDoc; movement: CashMovementDoc; deduplicated: boolean }> {
    this.verifyPermission(actor, 'pos_sessions.cash_movement');

    if (!Number.isInteger(input.amountHalalas) || input.amountHalalas <= 0) {
      throw new PosSessionError(
        PosSessionErrorCode.INVALID_PAYLOAD,
        'مبلغ الحركة النقدية يجب أن يكون رقماً صحيحاً موجباً بالهللات.'
      );
    }
    if (!input.reason || input.reason.trim().length < 2) {
      throw new PosSessionError(
        PosSessionErrorCode.INVALID_PAYLOAD,
        'يرجى إدخال سبب الحركة النقدية.'
      );
    }
    if (!input.idempotencyKey || input.idempotencyKey.trim().length < 6) {
      throw new PosSessionError(
        PosSessionErrorCode.INVALID_PAYLOAD,
        'مفتاح منع التكرار مطلوب للحركات النقدية.'
      );
    }

    const actorUid = this.getActorUid(actor);
    const sessionRef = this.firestore.doc(firestorePaths.posSession(input.tenantId, input.sessionId));
    const idemRef = this.firestore.doc(
      firestorePaths.posCashMovementIdempotency(input.tenantId, input.idempotencyKey)
    );
    const movementRef = this.firestore.collection(firestorePaths.posCashMovements(input.tenantId)).doc();
    const auditRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();

    return await this.firestore.runTransaction(async (transaction) => {
      const [idemSnap, sessionSnap] = await Promise.all([
        transaction.get(idemRef),
        transaction.get(sessionRef),
      ]);

      if (!sessionSnap.exists) {
        throw new PosSessionError(PosSessionErrorCode.SESSION_NOT_FOUND, 'جلسة الصندوق غير موجودة.');
      }
      const session = PosSessionDocSchema.parse(sessionSnap.data());
      this.verifyBranchAccess(actor, session.branchId);

      if (idemSnap.exists) {
        const existingMovementId = idemSnap.data()?.movementId as string;
        const existingMoveSnap = await transaction.get(
          this.firestore.doc(firestorePaths.posCashMovement(input.tenantId, existingMovementId))
        );
        if (existingMoveSnap.exists) {
          return {
            session,
            movement: CashMovementDocSchema.parse(existingMoveSnap.data()),
            deduplicated: true,
          };
        }
      }

      if (session.status !== 'OPEN') {
        throw new PosSessionError(
          PosSessionErrorCode.SESSION_NOT_OPEN,
          'لا يمكن تسجيل حركات نقدية على جلسة مغلقة أو قيد الإغلاق.'
        );
      }

      const cashInHalalas =
        session.cashInHalalas + (input.type === 'CASH_IN' ? input.amountHalalas : 0);
      const cashOutHalalas =
        session.cashOutHalalas + (input.type === 'CASH_OUT' ? input.amountHalalas : 0);
      const expectedCashHalalas = calculateExpectedCashHalalas({
        openingCashHalalas: session.openingCashHalalas,
        cashSalesHalalas: session.cashSalesHalalas,
        cashInHalalas,
        cashRefundsHalalas: session.cashRefundsHalalas,
        cashOutHalalas,
      });

      if (expectedCashHalalas < 0) {
        throw new PosSessionError(
          PosSessionErrorCode.INVALID_PAYLOAD,
          'لا يوجد رصيد نقدي كافٍ في الصندوق لإتمام عملية السحب.'
        );
      }

      const nowIso = new Date().toISOString();
      const updatedSession = PosSessionDocSchema.parse({
        ...session,
        cashInHalalas,
        cashOutHalalas,
        expectedCashHalalas,
        updatedAt: nowIso,
      });

      const movement = CashMovementDocSchema.parse({
        id: movementRef.id,
        tenantId: input.tenantId,
        branchId: session.branchId,
        sessionId: session.id,
        type: input.type,
        amountHalalas: input.amountHalalas,
        referenceId: null,
        reason: input.reason.trim(),
        idempotencyKey: input.idempotencyKey,
        actorUid,
        createdAt: nowIso,
      });

      const auditDoc = PosAuditDocSchema.parse({
        id: auditRef.id,
        tenantId: input.tenantId,
        branchId: session.branchId,
        action: 'CASH_MOVEMENT_RECORDED',
        entityType: 'CASH_MOVEMENT',
        entityId: movement.id,
        actorUid,
        idempotencyKey: input.idempotencyKey,
        details: {
          sessionId: session.id,
          type: input.type,
          amountHalalas: input.amountHalalas,
          expectedCashHalalas,
        },
        timestamp: nowIso,
      });

      transaction.set(sessionRef, updatedSession);
      transaction.set(movementRef, movement);
      transaction.set(idemRef, {
        id: input.idempotencyKey,
        movementId: movement.id,
        createdAt: nowIso,
      });
      transaction.set(auditRef, auditDoc);

      return { session: updatedSession, movement, deduplicated: false };
    });
  }

  async closeSession(
    actor: PosActor,
    input: {
      tenantId: string;
      sessionId: string;
      actualCountedCashHalalas: number;
      notes?: string;
    }
  ): Promise<PosSessionDoc> {
    this.verifyPermission(actor, 'pos_sessions.close');

    if (!Number.isInteger(input.actualCountedCashHalalas) || input.actualCountedCashHalalas < 0) {
      throw new PosSessionError(
        PosSessionErrorCode.INVALID_PAYLOAD,
        'المبلغ النقدي الفعلي المعدود يجب أن يكون رقماً صحيحاً غير سالب بالهللات.'
      );
    }

    const actorUid = this.getActorUid(actor);
    const sessionRef = this.firestore.doc(firestorePaths.posSession(input.tenantId, input.sessionId));
    const auditRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();

    return await this.firestore.runTransaction(async (transaction) => {
      const sessionSnap = await transaction.get(sessionRef);
      if (!sessionSnap.exists) {
        throw new PosSessionError(PosSessionErrorCode.SESSION_NOT_FOUND, 'جلسة الصندوق غير موجودة.');
      }
      const session = PosSessionDocSchema.parse(sessionSnap.data());
      this.verifyBranchAccess(actor, session.branchId);

      if (session.status === 'CLOSED') {
        throw new PosSessionError(
          PosSessionErrorCode.SESSION_NOT_OPEN,
          'جلسة الصندوق مغلقة مسبقاً ولا يمكن تعديلها.'
        );
      }

      const expectedCashHalalas = calculateExpectedCashHalalas(session);
      const cashDifferenceHalalas = input.actualCountedCashHalalas - expectedCashHalalas;
      const nowIso = new Date().toISOString();

      const closedSession = PosSessionDocSchema.parse({
        ...session,
        status: 'CLOSED',
        expectedCashHalalas,
        actualCountedCashHalalas: input.actualCountedCashHalalas,
        cashDifferenceHalalas,
        closingStartedAt: session.closingStartedAt || nowIso,
        closingBy: session.closingBy || actorUid,
        closedAt: nowIso,
        closedBy: actorUid,
        notes: input.notes !== undefined ? input.notes : session.notes,
        updatedAt: nowIso,
      });

      const lockId = `${session.branchId}_${session.cashierUid}`;
      const lockRef = this.firestore.doc(firestorePaths.posActiveSessionLock(input.tenantId, lockId));
      const lockSnap = await transaction.get(lockRef);

      transaction.set(sessionRef, closedSession);
      if (lockSnap.exists && lockSnap.data()?.sessionId === session.id) {
        transaction.set(lockRef, {
          ...lockSnap.data(),
          status: 'CLOSED',
          updatedAt: nowIso,
        });
      }

      const auditDoc = PosAuditDocSchema.parse({
        id: auditRef.id,
        tenantId: input.tenantId,
        branchId: session.branchId,
        action: 'CASH_SESSION_CLOSED',
        entityType: 'POS_SESSION',
        entityId: session.id,
        actorUid,
        idempotencyKey: null,
        details: {
          expectedCashHalalas,
          actualCountedCashHalalas: input.actualCountedCashHalalas,
          cashDifferenceHalalas,
        },
        timestamp: nowIso,
      });
      transaction.set(auditRef, auditDoc);

      return closedSession;
    });
  }

  async getActiveSession(
    actor: PosActor,
    tenantId: string,
    branchId: string,
    cashierUid?: string
  ): Promise<PosSessionDoc | null> {
    this.verifyPermission(actor, 'pos.access');
    this.verifyBranchAccess(actor, branchId);

    const targetUid = cashierUid || this.getActorUid(actor);
    const lockId = `${branchId}_${targetUid}`;
    const lockSnap = await this.firestore
      .doc(firestorePaths.posActiveSessionLock(tenantId, lockId))
      .get();

    if (!lockSnap.exists || lockSnap.data()?.status !== 'OPEN') {
      return null;
    }

    const sessionId = lockSnap.data()?.sessionId as string;
    const sessionSnap = await this.firestore
      .doc(firestorePaths.posSession(tenantId, sessionId))
      .get();

    if (!sessionSnap.exists) return null;
    const parsed = PosSessionDocSchema.parse(sessionSnap.data());
    return parsed.status === 'OPEN' ? parsed : null;
  }

  async getSessionById(
    actor: PosActor,
    tenantId: string,
    sessionId: string
  ): Promise<PosSessionDoc | null> {
    this.verifyPermission(actor, 'pos.access');
    const snap = await this.firestore.doc(firestorePaths.posSession(tenantId, sessionId)).get();
    if (!snap.exists) return null;
    const session = PosSessionDocSchema.parse(snap.data());
    this.verifyBranchAccess(actor, session.branchId);
    return session;
  }

  async listSessions(
    actor: PosActor,
    tenantId: string,
    filters?: { branchId?: string; status?: 'OPEN' | 'CLOSING' | 'CLOSED'; limit?: number }
  ): Promise<PosSessionDoc[]> {
    this.verifyPermission(actor, 'pos.access');
    if (filters?.branchId) {
      this.verifyBranchAccess(actor, filters.branchId);
    }

    let query: any = this.firestore.collection(firestorePaths.posSessions(tenantId));
    if (filters?.branchId) {
      query = query.where('branchId', '==', filters.branchId);
    }
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    query = query.orderBy('openedAt', 'desc').limit(filters?.limit || 50);

    const snap = await query.get();
    let results = snap.docs.map((d: any) => PosSessionDocSchema.parse(d.data()));

    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      results = results.filter((s: PosSessionDoc) => allowed.has(s.branchId));
    }

    return results;
  }

  async listCashMovements(
    actor: PosActor,
    tenantId: string,
    sessionId: string
  ): Promise<CashMovementDoc[]> {
    const session = await this.getSessionById(actor, tenantId, sessionId);
    if (!session) return [];

    const snap = await this.firestore
      .collection(firestorePaths.posCashMovements(tenantId))
      .where('sessionId', '==', sessionId)
      .orderBy('createdAt', 'desc')
      .get();

    return snap.docs.map((d) => CashMovementDocSchema.parse(d.data()));
  }

  async listPaymentMethodConfigs(
    actor: PosActor,
    tenantId: string
  ): Promise<PaymentMethodConfigDoc[]> {
    this.verifyPermission(actor, 'pos.access');
    const snap = await this.firestore
      .collection(firestorePaths.paymentMethodConfigs(tenantId))
      .get();

    const byMethod = new Map<PaymentMethodCode, PaymentMethodConfigDoc>();
    for (const d of snap.docs) {
      const parsed = PaymentMethodConfigDocSchema.parse(d.data());
      byMethod.set(parsed.method, parsed);
    }

    const nowIso = new Date().toISOString();
    return DEFAULT_PAYMENT_METHOD_CONFIGS.map((def) => {
      const existing = byMethod.get(def.method);
      if (existing) return existing;
      return PaymentMethodConfigDocSchema.parse({
        ...def,
        tenantId,
        updatedAt: nowIso,
        updatedBy: 'system_default',
      });
    });
  }

  async upsertPaymentMethodConfig(
    actor: PosActor,
    input: {
      tenantId: string;
      method: PaymentMethodCode;
      isEnabled: boolean;
      requiresReference?: boolean;
      labelAr?: string;
      labelEn?: string;
    }
  ): Promise<PaymentMethodConfigDoc> {
    this.verifyPermission(actor, 'payment_methods.manage');
    const method = PaymentMethodCodeEnum.parse(input.method);
    const def = DEFAULT_PAYMENT_METHOD_CONFIGS.find((d) => d.method === method)!;
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();

    const ref = this.firestore.doc(firestorePaths.paymentMethodConfig(input.tenantId, method));
    const auditRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();

    const config = PaymentMethodConfigDocSchema.parse({
      id: method,
      tenantId: input.tenantId,
      method,
      labelAr: input.labelAr?.trim() || def.labelAr,
      labelEn: input.labelEn?.trim() || def.labelEn,
      isEnabled: input.isEnabled,
      requiresReference: input.requiresReference ?? def.requiresReference,
      settlementAccountCode: def.settlementAccountCode,
      displayOrder: def.displayOrder,
      updatedAt: nowIso,
      updatedBy: actorUid,
    });

    const auditDoc = PosAuditDocSchema.parse({
      id: auditRef.id,
      tenantId: input.tenantId,
      branchId: null,
      action: 'PAYMENT_METHOD_CONFIGURED',
      entityType: 'PAYMENT_METHOD_CONFIG',
      entityId: method,
      actorUid,
      idempotencyKey: null,
      details: {
        isEnabled: config.isEnabled,
        requiresReference: config.requiresReference,
      },
      timestamp: nowIso,
    });

    await this.firestore.runTransaction(async (transaction) => {
      transaction.set(ref, config);
      transaction.set(auditRef, auditDoc);
    });

    return config;
  }
}

