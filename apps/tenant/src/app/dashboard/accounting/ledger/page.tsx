import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { LedgerViewer } from './ledger-viewer';

export const dynamic = 'force-dynamic';

export default async function LedgerPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const accRepo = new AccountingRepository();

  let accounts = await accRepo.listAccounts(tenant.tenantId);
  if (accounts.length === 0) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    accounts = await accRepo.listAccounts(tenant.tenantId);
  }

  const [journals, balances] = await Promise.all([
    accRepo.listJournalEntries(tenant.tenantId),
    accRepo.listAccountBalances(tenant.tenantId),
  ]);

  return (
    <LedgerViewer
      accounts={accounts}
      journals={journals}
      balances={balances}
    />
  );
}

