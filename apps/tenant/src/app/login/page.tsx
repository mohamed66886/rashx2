import { redirect } from 'next/navigation';
import { getAuthoritativeTenant, getTenantSession } from '@/lib/tenant-auth';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default async function TenantLoginPage() {
  // If already authenticated with active membership, redirect straight to dashboard
  const session = await getTenantSession();
  if (session) {
    redirect('/dashboard');
  }

  const tenant = await getAuthoritativeTenant(false);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAF9F8] text-[#54453D] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full mx-auto my-auto">
        {/* Salon Branding Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#91B8C0]/30 text-[#2C4349] font-black text-2xl mb-4 shadow-xs">
            {tenant?.name ? tenant.name.charAt(0) : 'R'}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#54453D]">
            {tenant?.name || 'بوابة إدارة الصالون'}
          </h1>
          {tenant?.slug && (
            <span className="inline-block mt-2 rounded-full bg-[#91B8C0]/20 px-3 py-1 text-xs font-mono text-[#2C4349]">
              {tenant.slug}.rashx.org
            </span>
          )}
          <p className="mt-2 text-xs text-[#54453D]/70">
            تسجيل دخول فريق العمل والإدارة
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#54453D]/10 shadow-xs">
          <LoginForm tenantName={tenant?.name} tenantSlug={tenant?.slug} />
        </div>

        <div className="mt-6 text-center text-xs text-[#54453D]/60 space-y-2">
          <p>
            هل أنت صاحب صالون جديد؟{' '}
            <a
              href="https://app.rashx.org/register"
              className="text-[#54453D] font-bold hover:underline"
            >
              سجل صالونك الآن على راش إكس
            </a>
          </p>
        </div>
      </div>

      <footer className="text-center text-xs text-[#54453D]/40">
        راش إكس — منصة إدارة الصالونات السحابية بالمملكة العربية السعودية
      </footer>
    </main>
  );
}
