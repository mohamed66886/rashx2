import { notFound, redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  PosSessionRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { SessionDetailClient } from './session-detail-client';

export const dynamic = 'force-dynamic';

export default async function PosSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'pos.access')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">لا تملك صلاحية عرض تفاصيل جلسة الصندوق.</p>
      </div>
    );
  }

  const { sessionId } = await params;
  const tenantId = session.tenant.tenantId;
  const posSessionRepo = new PosSessionRepository();
  const branchRepo = new BranchRepository();

  const posSession = await posSessionRepo.getSessionById(actor, tenantId, sessionId);
  if (!posSession) notFound();

  const [movements, branches] = await Promise.all([
    posSessionRepo.listCashMovements(actor, tenantId, sessionId),
    branchRepo.listBranches(tenantId),
  ]);

  const branchName =
    branches.find((b) => b.id === posSession.branchId)?.name || posSession.branchId;

  return (
    <SessionDetailClient
      posSession={posSession}
      movements={movements}
      branchName={branchName}
      canCashMovement={hasPermission(actor.role, 'pos_sessions.cash_movement')}
      canCloseSession={hasPermission(actor.role, 'pos_sessions.close')}
    />
  );
}

