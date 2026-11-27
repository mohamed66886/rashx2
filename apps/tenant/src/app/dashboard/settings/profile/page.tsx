import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/lib/dashboard-session';
import { CompanyRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { CompanyProfileForm } from './company-profile-form';
import { PageHeader, PageIcon, SettingsShell } from '../_components/settings-ui';

export const dynamic = 'force-dynamic';

export default async function CompanyProfilePage() {
  const session = await getDashboardSession(); // shared with the layout → no second lookup
  if (!session) redirect('/login');

  const { tenant } = session;
  const compRepo = new CompanyRepository();
  let profile = await compRepo.getCompanyProfile(tenant.tenantId);

  if (!profile) {
    await new TenantBootstrapService().reconcileTenant(tenant.tenantId);
    profile = await compRepo.getCompanyProfile(tenant.tenantId);
  }

  return (
    <SettingsShell>
      <PageHeader
        title="ملف المنشأة القانوني"
        desc="السجل التجاري، الشكل القانوني، الرقم الموحد 700، والعنوان الوطني المسجل لدى البريد السعودي (SPL)."
        icon={<PageIcon><path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 10h5a1 1 0 0 1 1 1v10M3 21h18M8 8h2M8 12h2M8 16h2" /></PageIcon>}
      />
      <CompanyProfileForm profile={profile} />
    </SettingsShell>
  );
}
