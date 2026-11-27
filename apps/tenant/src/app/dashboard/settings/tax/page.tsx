import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/lib/dashboard-session';
import { CompanyRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { TaxForm } from './tax-form';
import { PageHeader, PageIcon, SettingsShell } from '../_components/settings-ui';

export const dynamic = 'force-dynamic';

export default async function TaxSettingsPage() {
  const session = await getDashboardSession();
  if (!session) redirect('/login');

  const { tenant } = session;
  const compRepo = new CompanyRepository();
  let taxSettings = await compRepo.getTaxSettings(tenant.tenantId);

  if (!taxSettings) {
    await new TenantBootstrapService().reconcileTenant(tenant.tenantId);
    taxSettings = await compRepo.getTaxSettings(tenant.tenantId);
  }

  return (
    <SettingsShell>
      <PageHeader
        title="الضريبة والفواتير"
        desc="حالة التسجيل الضريبي، الرقم الضريبي المعتمد، وطريقة احتساب الضريبة في الفواتير."
        icon={<PageIcon><path d="M19 5L5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" /></PageIcon>}
        badge={
          <div className="hidden shrink-0 items-baseline gap-1 rounded-2xl bg-(--rx-blue) px-5 py-2.5 sm:flex" aria-label="نسبة الضريبة 15 بالمئة">
            <span className="text-4xl font-bold leading-none">15</span>
            <span className="text-xl font-bold">%</span>
          </div>
        }
      />
      <TaxForm taxSettings={taxSettings} />
    </SettingsShell>
  );
}
