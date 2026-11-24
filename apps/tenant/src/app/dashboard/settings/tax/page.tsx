import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { CompanyRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { TaxForm } from './tax-form';
import { SettingsShell } from '../_components/settings-ui';

export const dynamic = 'force-dynamic';

export default async function TaxSettingsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const compRepo = new CompanyRepository();
  let taxSettings = await compRepo.getTaxSettings(tenant.tenantId);

  if (!taxSettings) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    taxSettings = await compRepo.getTaxSettings(tenant.tenantId);
  }

  return (
    <SettingsShell>
      <header className="flex flex-col gap-4 rounded-xl bg-(--rx-blue) p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-extrabold">الضريبة والفواتير</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-(--rx-ink)/85">
            حالة التسجيل الضريبي، الرقم الضريبي المعتمد، وطريقة احتساب الضريبة في الفواتير.
          </p>
        </div>
        <div className="flex shrink-0 items-baseline gap-1 self-start rounded-xl sm:self-auto bg-white px-6 py-3" aria-label="نسبة الضريبة 15 بالمئة">
          <span className="text-5xl font-extrabold leading-none">15</span>
          <span className="text-2xl font-bold">%</span>
        </div>
      </header>

      <TaxForm taxSettings={taxSettings} />
    </SettingsShell>
  );
}
