'use client';

import { useState } from 'react';
import type { CompensationRecordDoc, CompensationModelType } from '@rashx/database';
import { saveCompensationAction } from '../actions';

export function CompensationCard({
  employeeId,
  canView,
  canManage,
  activeCompensation,
  compensationHistory,
}: {
  employeeId: string;
  canView: boolean;
  canManage: boolean;
  activeCompensation: CompensationRecordDoc | null;
  compensationHistory: CompensationRecordDoc[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modelType, setModelType] = useState<CompensationModelType>(
    activeCompensation?.modelType || 'FIXED_SALARY'
  );
  const [baseSalarySar, setBaseSalarySar] = useState<string>(
    activeCompensation?.fixed
      ? (activeCompensation.fixed.baseSalaryHalalas / 100).toFixed(2)
      : activeCompensation?.hybrid
        ? (activeCompensation.hybrid.baseSalaryHalalas / 100).toFixed(2)
        : '0.00'
  );
  const [commissionRate, setCommissionRate] = useState<string>(
    activeCompensation?.commission?.commissionRateBps !== undefined
      ? (activeCompensation.commission.commissionRateBps / 100).toString()
      : activeCompensation?.hybrid?.serviceCommissionRateBps !== undefined
        ? (activeCompensation.hybrid.serviceCommissionRateBps / 100).toString()
        : '10'
  );
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]!);
  const [notes, setNotes] = useState('');

  if (!canView) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div className="flex items-center gap-3 text-[#54453D]/60">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg">
            🔒
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#54453D]">البيانات المالية والتعاقدية (محمية)</h3>
            <p className="text-xs text-[#54453D]/60 mt-0.5">
              هذه المعلومات سرية للغاية ومحصورة بصلاحيات مالك المنشأة فقط (Owner-Only Confidentiality).
            </p>
          </div>
        </div>
      </div>
    );
  }

  async function handleSaveContract(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const baseSalaryHalalas = Math.round(parseFloat(baseSalarySar || '0') * 100);
    const commissionRateBps = Math.round(parseFloat(commissionRate || '0') * 100);

    const payload: any = {
      modelType,
      effectiveStartDate: startDate,
      notes: notes || undefined,
    };

    if (modelType === 'FIXED_SALARY') {
      payload.fixed = {
        baseSalaryHalalas,
        paymentFrequency: 'MONTHLY',
      };
    } else if (modelType === 'COMMISSION_BASED') {
      payload.commission = {
        commissionBasis: 'SERVICE_REVENUE_PERCENTAGE',
        commissionRateBps,
        eligibleCategoryIds: [],
      };
    } else if (modelType === 'HYBRID') {
      payload.hybrid = {
        baseSalaryHalalas,
        serviceCommissionBasis: 'SERVICE_REVENUE_PERCENTAGE',
        serviceCommissionRateBps: commissionRateBps,
      };
    }

    const result = await saveCompensationAction(employeeId, payload);
    setLoading(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error || 'حدث خطأ أثناء حفظ العقد');
    }
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
            <span>💰</span> الهيكل المالي والتعاقدي (الرواتب والعمولات)
          </h3>
          <p className="text-xs text-[#54453D]/60 mt-0.5">
            سجل العقود والمستحقات، التاريخ المالي وحسابات التعويضات (محفوظة بالهللات بدقة تامة).
          </p>
        </div>
        {canManage && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-2xs"
          >
            {activeCompensation ? 'تحديث / تعديل العقد' : 'إنشاء عقد مالي'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl text-xs font-bold bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* Contract Editing Form */}
      {isEditing ? (
        <form onSubmit={handleSaveContract} className="bg-[#FAF9F8] p-5 rounded-2xl border border-[#54453D]/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#54453D]">تسجيل عقد مالي جديد (سيتم أرشفة السابق تلقائياً)</h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-[#54453D]/60 hover:text-[#54453D]"
            >
              إلغاء
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1.5">
                نموذج التعويض المالي *
              </label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value as CompensationModelType)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
              >
                <option value="FIXED_SALARY">راتب شهري ثابت فقط (Fixed Salary)</option>
                <option value="COMMISSION_BASED">عمولة فقط على المبيعات (Commission Only)</option>
                <option value="HYBRID">نموذج هجين (راتب أساسي + عمولة مبيعات)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1.5">
                تاريخ سريان العقد الجديد *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white font-mono"
              />
            </div>
          </div>

          {/* Fixed Salary Inputs */}
          {(modelType === 'FIXED_SALARY' || modelType === 'HYBRID') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1.5">
                  الراتب الأساسي الشهري (ريال) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={baseSalarySar}
                  onChange={(e) => setBaseSalarySar(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white font-mono"
                />
              </div>
            </div>
          )}

          {/* Commission Inputs */}
          {(modelType === 'COMMISSION_BASED' || modelType === 'HYBRID') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1.5">
                  نسبة العمولة المئوية (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              ملاحظات تعاقدية إضافية
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="شروط خاصة أو استثناءات..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 disabled:opacity-50"
            >
              {loading ? 'جاري الاعتماد...' : 'اعتماد العقد وسريانه'}
            </button>
          </div>
        </form>
      ) : activeCompensation ? (
        /* Active Contract Summary */
        <div className="bg-[#FAF9F8] p-5 rounded-2xl border border-[#54453D]/10 space-y-4">
          <div className="flex items-center justify-between border-b border-[#54453D]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#54453D]">العقد الساري حالياً</span>
            </div>
            <span className="text-[11px] font-mono text-[#54453D]/60">
              بدء السريان: {activeCompensation.effectiveStartDate}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-[#54453D]/60 font-medium">نوع الهيكل</p>
              <p className="text-xs font-bold text-[#54453D] mt-0.5">
                {activeCompensation.modelType === 'FIXED_SALARY' && 'راتب شهري ثابت'}
                {activeCompensation.modelType === 'COMMISSION_BASED' && 'عمولة مبيعات فقط'}
                {activeCompensation.modelType === 'HYBRID' && 'هجين (راتب + عمولة)'}
              </p>
            </div>

            {activeCompensation.fixed && (
              <div>
                <p className="text-[11px] text-[#54453D]/60 font-medium">الراتب الأساسي</p>
                <p className="text-sm font-black text-emerald-800 font-mono mt-0.5">
                  {(activeCompensation.fixed.baseSalaryHalalas / 100).toLocaleString('ar-SA', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  ريال
                </p>
              </div>
            )}

            {activeCompensation.hybrid && (
              <div>
                <p className="text-[11px] text-[#54453D]/60 font-medium">الراتب الأساسي (هجين)</p>
                <p className="text-sm font-black text-emerald-800 font-mono mt-0.5">
                  {(activeCompensation.hybrid.baseSalaryHalalas / 100).toLocaleString('ar-SA', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  ريال
                </p>
              </div>
            )}

            {activeCompensation.commission && (
              <div>
                <p className="text-[11px] text-[#54453D]/60 font-medium">نسبة العمولة</p>
                <p className="text-sm font-black text-[#2C4349] font-mono mt-0.5">
                  {((activeCompensation.commission.commissionRateBps || 0) / 100)}%
                </p>
              </div>
            )}

            {activeCompensation.hybrid && activeCompensation.hybrid.serviceCommissionRateBps !== undefined && (
              <div>
                <p className="text-[11px] text-[#54453D]/60 font-medium">عمولة الخدمات (هجين)</p>
                <p className="text-sm font-black text-[#2C4349] font-mono mt-0.5">
                  {(activeCompensation.hybrid.serviceCommissionRateBps / 100)}%
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-[#54453D]/60 bg-[#FAF9F8] rounded-2xl border border-dashed border-[#54453D]/20">
          <p className="text-xs font-medium">لم يتم تسجيل هيكل مالي أو عقد رواتب لهذا الموظف بعد.</p>
        </div>
      )}

      {/* Contract History Log */}
      {compensationHistory.length > 1 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-[#54453D] mb-3">سجل العقود السابقة (أرشيف غير قابل للتعديل)</h4>
          <div className="space-y-2">
            {compensationHistory
              .filter((c) => c.status === 'SUPERSEDED')
              .map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-[#FAF9F8] rounded-xl border border-[#54453D]/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#54453D]">
                      {c.modelType === 'FIXED_SALARY' ? 'راتب ثابت' : c.modelType === 'COMMISSION_BASED' ? 'عمولة' : 'هجين'}
                    </span>
                    {c.fixed && (
                      <span className="mr-2 font-mono text-[#54453D]/70">
                        ({(c.fixed.baseSalaryHalalas / 100).toFixed(2)} ر.س)
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#54453D]/50">
                    من {c.effectiveStartDate} إلى {c.effectiveEndDate || '—'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
