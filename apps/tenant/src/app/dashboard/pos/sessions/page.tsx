import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  PosSessionRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { SessionsClient } from './sessions-client';

export const dynamic = 'force-dynamic';

export default async function PosSessionsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'pos.access')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">لا تملك صلاحية عرض جلسات الصندوق.</p>
      </div>
    );
  }

  const tenantId = session.tenant.tenantId;
  const branchRepo = new BranchRepository();
  const posSessionRepo = new PosSessionRepository();

  const [allBranches, sessions] = await Promise.all([
    branchRepo.listBranches(tenantId),
    posSessionRepo.listSessions(actor, tenantId, { limit: 60 }),
  ]);

  const branches =
    actor.role !== 'OWNER' && actor.assignedBranchIds && actor.assignedBranchIds.length > 0
      ? allBranches.filter((b) => actor.assignedBranchIds!.includes(b.id))
      : allBranches;

  return (
    <SessionsClient
      branches={branches}
      sessions={sessions}
      canOpenSession={hasPermission(actor.role, 'pos_sessions.open')}
    />
  );
}

