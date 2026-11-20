export default function TenantHomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#54453D]/10">
        <span className="inline-block rounded-full bg-[#91B8C0]/30 px-3 py-1 text-xs font-semibold text-[#2C4349] mb-4">
          {"{tenant}.rashx.org"}
        </span>
        <h1 className="text-2xl font-bold text-[#54453D] mb-2">
          منظومة الصالون المتكاملة
        </h1>
        <p className="text-sm text-[#54453D]/70 mb-6">
          RASHX Salon Portal & Dashboard — Skeleton Initialized (Phase 2)
        </p>
        <div className="text-xs text-[#54453D]/50 border-t border-[#54453D]/10 pt-4 space-y-1">
          <div>Public Website: {"{tenant}.rashx.org"}</div>
          <div>Salon Dashboard: {"{tenant}.rashx.org/dashboard"}</div>
        </div>
      </div>
    </main>
  );
}

