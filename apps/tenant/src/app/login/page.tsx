import { redirect } from 'next/navigation';
import { getAuthoritativeTenant, getTenantSession } from '@/lib/tenant-auth';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

const FONT = "'Ping AR + LT','IBM Plex Sans Arabic',Tahoma,sans-serif";

export default async function TenantLoginPage() {
  // If already authenticated with active membership, redirect straight to dashboard
  const session = await getTenantSession();
  if (session) {
    redirect('/dashboard');
  }

  const tenant = await getAuthoritativeTenant(false);
  const initial = tenant?.name ? tenant.name.charAt(0) : 'R';
  const title = tenant?.name || 'بوابة إدارة الصالون';

  return (
    <main dir="rtl" style={{ fontFamily: FONT }} className="flex min-h-screen flex-col bg-white text-[#54453D] lg:flex-row">
      {/* Mobile brand band */}
      <header className="flex items-center justify-between bg-[#91B8C0] px-5 py-4 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wordmark-arabic-ink.svg" alt="راش إكس" className="h-6 w-auto" />
        {tenant?.slug && (
          <span dir="ltr" className="rounded-full bg-white px-3 py-1 font-mono text-xs font-medium">
            {tenant.slug}.rashx.org
          </span>
        )}
      </header>

      {/* Form side */}
      <section className="flex flex-1 flex-col px-5 pb-8 pt-10 sm:px-10 lg:px-24 lg:pb-12 lg:pt-11">
        <div className="hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wordmark-arabic-ink.svg" alt="راش إكس" className="h-7 w-auto" />
        </div>

        <div className="mx-auto my-auto w-full max-w-[440px] py-8">
          {/* Salon identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#F0C5AE] text-[28px] font-bold">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="m-0 truncate text-2xl font-bold leading-tight lg:text-[28px]">{title}</h1>
              {tenant?.slug && (
                <span dir="ltr" className="mt-1.5 inline-block rounded-full border border-[#E6DDD6] bg-[#FAF9F8] px-3 py-1 font-mono text-[13px] font-medium">
                  {tenant.slug}.rashx.org
                </span>
              )}
            </div>
          </div>

          <p className="mb-8 mt-6 text-base leading-[1.7] text-[#6B5B52]">تسجيل دخول فريق العمل والإدارة</p>

          <LoginForm tenantName={tenant?.name} tenantSlug={tenant?.slug} />

          <p className="mt-8 text-center text-sm leading-[1.8] text-[#6B5B52]">
            هل أنت صاحب صالون جديد؟{' '}
            <a href="https://app.rashx.org/register" className="font-bold text-[#54453D] underline">
              سجل صالونك الآن على راش إكس
            </a>
          </p>
        </div>

        <footer className="text-center text-xs text-[#6B5B52]">
          راش إكس — منصة إدارة الصالونات السحابية بالمملكة العربية السعودية
        </footer>
      </section>

      {/* Brand panel (desktop) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#91B8C0] p-14 text-[#54453D] lg:flex lg:w-[560px] lg:shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/symbol-rx-white.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -left-52 -top-28 w-[640px] opacity-25" />

        <div className="relative">
          <span className="inline-block rounded-full bg-white px-4 py-2 text-[13px] font-bold">لوحة إدارة الصالون</span>
          <h2 className="mt-[18px] max-w-[420px] text-[32px] font-bold leading-[1.4]">أهلًا بعودتك، فريقك بانتظارك</h2>
        </div>

        <div className="relative rounded-3xl bg-white p-7 shadow-[0_24px_60px_rgba(84,69,61,0.16)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#54453D]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/symbol-rx-white.svg" alt="" aria-hidden="true" className="w-[30px]" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xl font-bold">{title}</div>
              {tenant?.slug && (
                <div dir="ltr" className="mt-1 text-right font-mono text-sm text-[#6B5B52]">{tenant.slug}.rashx.org</div>
              )}
            </div>
          </div>
          <div className="my-5 h-px bg-[#E6DDD6]" />
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[15px] leading-[1.6]">
            {['ادخل بالبريد الإلكتروني الذي سجّلت به', 'الدخول مخصص لفريق هذا الصالون وإدارته'].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#F0C5AE]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#54453D" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
