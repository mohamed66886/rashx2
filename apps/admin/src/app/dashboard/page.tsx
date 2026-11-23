import { SubscriptionsManager } from './subscriptions-manager';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#FAF9F8] text-[#54453D] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-[#54453D]/10 px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#54453D] text-white font-black flex items-center justify-center text-lg shadow-2xs">
              R
            </div>
            <div>
              <h1 className="text-base font-bold text-[#54453D] leading-tight">
                منصة راش إكس — إدارة الاشتراكات والحوكمة
              </h1>
              <span className="text-xs text-[#54453D]/60 font-mono">
                admin.rashx.org
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-block rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold">
              SUPER_ADMIN
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#54453D]">
            إدارة اشتراكات الصالونات وتفعيل الفترات التجريبية
          </h2>
          <p className="text-xs text-[#54453D]/60 mt-1">
            متابعة الصالونات المسجلة، وفترات التجربة المجانية (3 أيام)، واعتماد وتفعيل الاشتراكات يدوياً بعد تأكيد السداد.
          </p>
        </div>

        <SubscriptionsManager />
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#54453D]/40 border-t border-[#54453D]/5">
        نظام راش إكس السحابي للصالونات والسبا — بوابة الإدارة المركزية 2026
      </footer>
    </main>
  );
}
