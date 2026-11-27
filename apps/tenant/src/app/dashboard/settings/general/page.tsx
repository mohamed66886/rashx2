import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/lib/dashboard-session';
import { CompanyRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { GeneralForm } from './general-form';
import { PageHeader, PageIcon, SettingsShell } from '../_components/settings-ui';

export const dynamic = 'force-dynamic';

export default async function GeneralSettingsPage() {
  const session = await getDashboardSession();
  if (!session) redirect('/login');

  const { tenant } = session;
  const compRepo = new CompanyRepository();
  let settings = await compRepo.getGeneralSettings(tenant.tenantId);

  if (!settings) {
    await new TenantBootstrapService().reconcileTenant(tenant.tenantId);
    settings = await compRepo.getGeneralSettings(tenant.tenantId);
  }

  return (
    <SettingsShell>
      <PageHeader
        title="الإعدادات العامة"
        desc="المنطقة الزمنية، لغة النظام، التقويم المعتمد، وبداية أسبوع العمل."
        icon={<PageIcon><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></PageIcon>}
      />
      <GeneralForm settings={settings} />
    </SettingsShell>
  );
}
