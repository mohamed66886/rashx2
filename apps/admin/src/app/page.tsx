export default function AdminHomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#54453D]/10">
        <span className="inline-block rounded-full bg-[#54453D]/10 px-3 py-1 text-xs font-semibold text-[#54453D] mb-4">
          admin.rashx.org
        </span>
        <h1 className="text-2xl font-bold text-[#54453D] mb-2">
          إدارة منصة راش إكس
        </h1>
        <p className="text-sm text-[#54453D]/70 mb-6">
          RASHX Platform Administration — Skeleton Initialized (Phase 2)
        </p>
        <div className="text-xs text-[#54453D]/50 border-t border-[#54453D]/10 pt-4">
          Reserved for platform operators, tenant governance, compliance, and subscription oversight.
        </div>
      </div>
    </main>
  );
}

