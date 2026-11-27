import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  PosRepository,
  hasPermission,
  type InvoiceDoc,
} from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

const STATUS_LABELS: Record<
  InvoiceDoc['status'],
  { label: string; badgeClass: string }
> = {
  DRAFT: { label: 'مسودة', badgeClass: 'bg-gray-100 text-gray-700 border-gray-200' },
  ISSUED: { label: 'صادرة (غير مدفوعة)', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  PARTIALLY_PAID: { label: 'مدفوعة جزئياً', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  PAID: { label: 'مدفوعة بالكامل', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  VOIDED: { label: 'ملغاة', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  PARTIALLY_REFUNDED: { label: 'مستردة جزئياً', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
  REFUNDED: { label: 'مستردة بالكامل', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
};

export default async function PosInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string; status?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'invoices.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">لا تملك صلاحية عرض الفواتير.</p>
      </div>
    );
  }

  const sp = await searchParams;
  const tenantId = session.tenant.tenantId;
  const branchRepo = new BranchRepository();
  const posRepo = new PosRepository();

  const validStatuses: InvoiceDoc['status'][] = [
    'DRAFT',
    'ISSUED',
    'PARTIALLY_PAID',
    'PAID',
    'VOIDED',
    'PARTIALLY_REFUNDED',
    'REFUNDED',
  ];
  const selectedStatus = validStatuses.includes(sp.status as InvoiceDoc['status'])
    ? (sp.status as InvoiceDoc['status'])
    : undefined;

  const [allBranches, invoices] = await Promise.all([
    branchRepo.listBranches(tenantId),
    posRepo.listInvoices(actor, tenantId, {
      branchId: sp.branchId || undefined,
      status: selectedStatus,
      limit: 100,
    }),
  ]);

  const branches =
    actor.role !== 'OWNER' && actor.assignedBranchIds && actor.assignedBranchIds.length > 0
      ? allBranches.filter((b) => actor.assignedBranchIds!.includes(b.id))
      : allBranches;

  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  const totalNetSar = invoices
    .filter((i) => i.status !== 'VOIDED')
    .reduce((acc, i) => acc + i.totalAmountHalalas, 0);
  const totalPaidSar = invoices
    .filter((i) => i.status !== 'VOIDED')
    .reduce((acc, i) => acc + i.paidAmountHalalas, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D221D]">الفواتير</h1>
          <p className="text-xs text-[#6B5B52] mt-1">
            سجل فواتير نقطة البيع وحالات التحصيل والضريبة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/pos"
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C] transition-colors"
          >
            + فاتورة / عملية بيع جديدة
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">عدد الفواتير المعروضة</p>
          <p className="text-2xl font-black text-[#2D221D] mt-1">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">إجمالي قيمة الفواتير النشطة</p>
          <p className="text-2xl font-black text-[#2D221D] mt-1">
            {formatSar(totalNetSar)} <span className="text-xs font-normal">ر.س</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">إجمالي المبالغ المحصلة</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {formatSar(totalPaidSar)} <span className="text-xs font-normal">ر.س</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <form
        method="GET"
        className="bg-white rounded-2xl border border-[#E6DDD6] p-4 flex flex-wrap items-end gap-4"
      >
        <div className="min-w-[180px] flex-1">
          <label className="block text-xs font-bold text-[#54453D] mb-1">الفرع</label>
          <select
            name="branchId"
            defaultValue={sp.branchId || ''}
            className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs text-[#2D221D]"
          >
            <option value="">جميع الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="block text-xs font-bold text-[#54453D] mb-1">الحالة</label>
          <select
            name="status"
            defaultValue={selectedStatus || ''}
            className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs text-[#2D221D]"
          >
            <option value="">جميع الحالات</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C]"
        >
          تصفية
        </button>
        {(sp.branchId || selectedStatus) && (
          <Link
            href="/dashboard/pos/invoices"
            className="px-4 py-2 rounded-xl border border-[#E6DDD6] text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3]"
          >
            إعادة ضبط
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#6B5B52]">
            لا توجد فواتير مطابقة للبحث.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">رقم الفاتورة</th>
                  <th className="py-3 px-4 font-bold">العميل</th>
                  <th className="py-3 px-4 font-bold">الفرع</th>
                  <th className="py-3 px-4 font-bold">التاريخ</th>
                  <th className="py-3 px-4 font-bold">الإجمالي</th>
                  <th className="py-3 px-4 font-bold">المدفوع</th>
                  <th className="py-3 px-4 font-bold">المتبقي</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                  <th className="py-3 px-4 font-bold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {invoices.map((inv) => {
                  const st = STATUS_LABELS[inv.status];
                  return (
                    <tr key={inv.id} className="hover:bg-[#FAF6F3]/60">
                      <td className="py-3 px-4 font-bold text-[#2D221D] font-mono">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#2D221D]">
                          {inv.customerSnapshot.fullName}
                        </div>
                        {inv.customerSnapshot.phone && (
                          <div className="text-[11px] text-[#6B5B52]" dir="ltr">
                            {inv.customerSnapshot.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#54453D]">
                        {branchMap.get(inv.branchId) || inv.branchId}
                      </td>
                      <td className="py-3 px-4 text-[#6B5B52]" dir="ltr">
                        {new Date(inv.issuedAt).toLocaleString('ar-SA', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#2D221D]">
                        {formatSar(inv.totalAmountHalalas)} ر.س
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">
                        {formatSar(inv.paidAmountHalalas)} ر.س
                      </td>
                      <td className="py-3 px-4 text-amber-800 font-bold">
                        {formatSar(inv.balanceDueHalalas)} ر.س
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-bold ${st.badgeClass}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/pos/invoices/${inv.id}`}
                          className="px-3 py-1.5 rounded-lg bg-[#FAF6F3] border border-[#E6DDD6] text-[#54453D] font-bold hover:bg-[#E6DDD6]/50"
                        >
                          عرض وطباعة
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
