// Shown instantly while a dashboard page streams in → navigation feels immediate
// and the shell (rail / panel / header) never blanks out.
export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="animate-pulse space-y-5">
      <span className="sr-only">جاري التحميل…</span>
      <div className="h-8 w-56 rounded-xl bg-[#E6DDD6]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-[#E6DDD6] bg-white" />
        ))}
      </div>
      <div className="h-80 rounded-3xl border border-[#E6DDD6] bg-white" />
    </div>
  );
}
