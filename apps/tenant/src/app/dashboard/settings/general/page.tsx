import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { CompanyRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { GeneralForm } from './general-form';
import { RxSymbol } from '../_components/rx-symbol';
import { SettingsShell } from '../_components/settings-ui';

export const dynamic = 'force-dynamic';

export default async function GeneralSettingsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const compRepo = new CompanyRepository();
  let settings = await compRepo.getGeneralSettings(tenant.tenantId);

  if (!settings) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    settings = await compRepo.getGeneralSettings(tenant.tenantId);
  }

  return (
    <SettingsShell>
      <header className="flex items-center justify-between gap-4 rounded-xl border border-(--rx-line) bg-(--rx-cream) p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-extrabold">الإعدادات العامة</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-(--rx-ink)/75">
            المنطقة الزمنية، لغة النظام، التقويم المعتمد، وبداية أسبوع العمل.
          </p>
        </div>
        <RxSymbol size={44} className="hidden shrink-0 opacity-90 sm:block" />
      </header>

      <GeneralForm settings={settings} />
    </SettingsShell>
  );
}
