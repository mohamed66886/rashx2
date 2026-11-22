export default function AppDashboardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#54453D]/10 shadow-sm">
        <span className="inline-block rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D] mb-4">
          app.rashx.org/dashboard
        </span>
        <h1 className="text-2xl font-bold text-[#54453D] mb-2">
          لوحة إدارة المنشآت والاشتراكات
        </h1>
        <p className="text-sm text-[#54453D]/70 mb-4">
          Central Organization Hub & Multi-Tenant Management
        </p>
        <div className="text-xs text-[#54453D]/50 border-t border-[#54453D]/10 pt-4">
          Manage your subscription, branches, billing, and linked salons.
        </div>
      </div>
    </main>
  );
}

