export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#54453D]/10 shadow-sm">
        <span className="inline-block rounded-full bg-[#54453D]/10 px-3 py-1 text-xs font-semibold text-[#54453D] mb-4">
          admin.rashx.org/dashboard
        </span>
        <h1 className="text-2xl font-bold text-[#54453D] mb-2">
          لوحة القيادة التشغيلية للمنصة
        </h1>
        <p className="text-sm text-[#54453D]/70 mb-4">
          RASHX Platform Operations & Governance Dashboard
        </p>
        <div className="text-xs text-[#54453D]/50 border-t border-[#54453D]/10 pt-4">
          Restricted to authoritative platform operators with verified SUPER_ADMIN privileges.
        </div>
      </div>
    </main>
  );
}

