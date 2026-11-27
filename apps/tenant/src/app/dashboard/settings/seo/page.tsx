import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/lib/dashboard-session';
import { CompanyRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { SeoForm } from './seo-form';
import { PageHeader, PageIcon, SettingsShell } from '../_components/settings-ui';

export const dynamic = 'force-dynamic';

export default async function SeoSettingsPage() {
  const session = await getDashboardSession();
  if (!session) redirect('/login');

  const { tenant } = session;
  const compRepo = new CompanyRepository();
  let seoSettings = await compRepo.getSeoSettings(tenant.tenantId);

  if (!seoSettings) {
    await new TenantBootstrapService().reconcileTenant(tenant.tenantId);
    seoSettings = await compRepo.getSeoSettings(tenant.tenantId);
  }

  return (
    <SettingsShell>
      <PageHeader
        title="الظهور في محركات البحث"
        desc="عنوان صفحة الصالون ووصفها كما يراها العملاء في Google."
        icon={<PageIcon><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></PageIcon>}
      />
      <SeoForm seoSettings={seoSettings} />
    </SettingsShell>
  );
}
