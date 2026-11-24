import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { CompanyRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { SeoForm } from './seo-form';
import { SettingsShell } from '../_components/settings-ui';

export const dynamic = 'force-dynamic';

export default async function SeoSettingsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const compRepo = new CompanyRepository();
  let seoSettings = await compRepo.getSeoSettings(tenant.tenantId);

  if (!seoSettings) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    seoSettings = await compRepo.getSeoSettings(tenant.tenantId);
  }

  return (
    <SettingsShell>
      <header className="rounded-xl border border-(--rx-line) bg-white p-5 sm:p-6">
        <h2 className="text-xl font-extrabold">الظهور في محركات البحث</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-(--rx-ink)/75">
          عنوان صفحة الصالون ووصفها كما يراها العملاء في Google.
        </p>
        <div className="mt-4 h-1 w-24 rounded-full bg-(--rx-peach)" />
      </header>

      <SeoForm seoSettings={seoSettings} />
    </SettingsShell>
  );
}
