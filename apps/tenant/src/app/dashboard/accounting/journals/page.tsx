import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { JournalManager } from './journal-manager';

export const dynamic = 'force-dynamic';

export default async function JournalsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const accRepo = new AccountingRepository();

  let accounts = await accRepo.listAccounts(tenant.tenantId);
  if (accounts.length === 0) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    accounts = await accRepo.listAccounts(tenant.tenantId);
  }

  const [entries, periods] = await Promise.all([
    accRepo.listJournalEntries(tenant.tenantId),
    accRepo.listAccountingPeriods(tenant.tenantId),
  ]);

  const openPeriods = periods.filter((p) => p.status === 'OPEN');

  return (
    <JournalManager
      entries={entries}
      accounts={accounts}
      openPeriods={openPeriods}
      isOwner={membership.role === 'OWNER'}
    />
  );
}

