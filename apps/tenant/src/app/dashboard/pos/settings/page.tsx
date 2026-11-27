import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import { PosSessionRepository, hasPermission } from '@/lib/firebase-server';
import { PosSettingsClient } from './settings-client';

export const dynamic = 'force-dynamic';

export default async function PosSettingsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'pos.access')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">لا تملك صلاحية عرض إعدادات وسائل الدفع.</p>
      </div>
    );
  }

  const posSessionRepo = new PosSessionRepository();
  const paymentMethods = await posSessionRepo.listPaymentMethodConfigs(
    actor,
    session.tenant.tenantId
  );

  return (
    <PosSettingsClient
      paymentMethods={paymentMethods}
      canManage={hasPermission(actor.role, 'payment_methods.manage')}
    />
  );
}

