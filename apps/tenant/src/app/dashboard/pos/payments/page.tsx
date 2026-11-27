import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  PosRepository,
  hasPermission,
  type PaymentMethodCode,
} from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

const METHOD_LABELS: Record<PaymentMethodCode, string> = {
  CASH: 'نقدي',
  CARD: 'بطاقة / شبكة',
  BANK_TRANSFER: 'تحويل بنكي',
  OTHER: 'وسيلة أخرى',
};

export default async function PosPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'payments.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">لا تملك صلاحية عرض سجل المدفوعات.</p>
      </div>
    );
  }

  const sp = await searchParams;
  const tenantId = session.tenant.tenantId;
  const branchRepo = new BranchRepository();
  const posRepo = new PosRepository();

  const [allBranches, payments] = await Promise.all([
    branchRepo.listBranches(tenantId),
    posRepo.listPayments(actor, tenantId, {
      branchId: sp.branchId || undefined,
      limit: 120,
    }),
  ]);

  const branches =
    actor.role !== 'OWNER' && actor.assignedBranchIds && actor.assignedBranchIds.length > 0
      ? allBranches.filter((b) => actor.assignedBranchIds!.includes(b.id))
      : allBranches;
  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  const totalCollectedHalalas = payments
    .filter((p) => p.status === 'RECORDED')
    .reduce((acc, p) => acc + p.amountHalalas, 0);
  const totalRefundedHalalas = payments.reduce((acc, p) => acc + p.refundedAmountHalalas, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D221D]">سجل المدفوعات</h1>
          <p className="text-xs text-[#6B5B52] mt-1">
            سجل عمليات الدفع المسجلة والمستردة عبر نقطة البيع
          </p>
        </div>
        <Link
          href="/dashboard/pos/invoices"
          className="px-4 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3]"
        >
          عرض الفواتير
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">عدد المدفوعات</p>
          <p className="text-2xl font-black text-[#2D221D] mt-1">{payments.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">إجمالي المدفوعات المسجلة</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {formatSar(totalCollectedHalalas)} <span className="text-xs font-normal">ر.س</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">إجمالي المبالغ المستردة</p>
          <p className="text-2xl font-black text-purple-700 mt-1">
            {formatSar(totalRefundedHalalas)} <span className="text-xs font-normal">ر.س</span>
          </p>
        </div>
      </div>

      <form
        method="GET"
        className="bg-white rounded-2xl border border-[#E6DDD6] p-4 flex flex-wrap items-end gap-4"
      >
        <div className="min-w-[200px] flex-1 max-w-xs">
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
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C]"
        >
          تصفية
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#6B5B52]">
            لا توجد مدفوعات مسجلة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">رقم الفاتورة</th>
                  <th className="py-3 px-4 font-bold">الفرع</th>
                  <th className="py-3 px-4 font-bold">وسيلة الدفع</th>
                  <th className="py-3 px-4 font-bold">المبلغ</th>
                  <th className="py-3 px-4 font-bold">المسترد</th>
                  <th className="py-3 px-4 font-bold">المرجع</th>
                  <th className="py-3 px-4 font-bold">التاريخ</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF6F3]/60">
                    <td className="py-3 px-4 font-bold font-mono">
                      <Link
                        href={`/dashboard/pos/invoices/${p.invoiceId}`}
                        className="text-[#54453D] underline hover:text-[#2D221D]"
                      >
                        {p.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-[#54453D]">
                      {branchMap.get(p.branchId) || p.branchId}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2D221D]">
                      {METHOD_LABELS[p.method]}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatSar(p.amountHalalas)} ر.س
                    </td>
                    <td className="py-3 px-4 text-purple-700">
                      {p.refundedAmountHalalas > 0 ? `${formatSar(p.refundedAmountHalalas)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#6B5B52] font-mono">
                      {p.referenceNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#6B5B52]" dir="ltr">
                      {new Date(p.receivedAt).toLocaleString('ar-SA', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          p.status === 'REVERSED'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : p.status === 'FAILED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {p.status === 'RECORDED'
                          ? 'مسجلة'
                          : p.status === 'REVERSED'
                            ? 'معكوسة'
                            : 'فاشلة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

