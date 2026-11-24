import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { CompanyRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { CompanyProfileForm } from './company-profile-form';
import { RxSymbol } from '../_components/rx-symbol';
import { SettingsShell } from '../_components/settings-ui';

export const dynamic = 'force-dynamic';

export default async function CompanyProfilePage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const compRepo = new CompanyRepository();
  let profile = await compRepo.getCompanyProfile(tenant.tenantId);

  if (!profile) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    profile = await compRepo.getCompanyProfile(tenant.tenantId);
  }

  return (
    <SettingsShell>
      <header className="flex items-center gap-5 rounded-xl bg-(--rx-peach) p-5 sm:p-6">
        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-white">
          <RxSymbol size={34} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">ملف المنشأة القانوني</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-(--rx-ink)/80">
            السجل التجاري، الشكل القانوني، الرقم الموحد 700، والعنوان الوطني المسجل لدى البريد السعودي (SPL).
          </p>
        </div>
      </header>

      <CompanyProfileForm profile={profile} />
    </SettingsShell>
  );
}
