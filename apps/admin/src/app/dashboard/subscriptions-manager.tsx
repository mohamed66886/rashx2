'use client';

import React, { useState, useEffect, useTransition } from 'react';

interface SalonItem {
  tenant: {
    id: string;
    name: string;
    commercialName: string;
    slug: string;
    status: string;
    primaryOwnerUid: string;
    createdAt: string;
  };
  subscription: {
    tenantId: string;
    planId: string;
    status: string;
    trialStartedAt: string;
    trialEndsAt: string;
    trialDurationDays: number;
    currentPeriodStartedAt: string | null;
    currentPeriodEndsAt: string | null;
    activatedAt: string | null;
    activatedBy: string | null;
    lastActivationNote: string | null;
  };
  evaluation: {
    allowed: boolean;
    effectiveStatus: string;
    isTrial: boolean;
    isExpired: boolean;
    remainingTrialHours: number;
    trialEndsAt: string;
  };
}

interface AuditRecord {
  id: string;
  action: string;
  actorUid: string;
  previousStatus: string;
  newStatus: string;
  durationDays?: number;
  note?: string;
  timestamp: string;
}

export function SubscriptionsManager() {
  const [salons, setSalons] = useState<SalonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Activation modal state
  const [activeModalSalon, setActiveModalSalon] = useState<SalonItem | null>(null);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [selectedPlan, setSelectedPlan] = useState<string>('STARTER');
  const [activationNote, setActivationNote] = useState<string>('');
  const [adminUidInput, setAdminUidInput] = useState<string>('platform_admin_super');
  const [isActivating, startActivating] = useTransition();
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Audit trail modal state
  const [auditSalon, setAuditSalon] = useState<SalonItem | null>(null);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/subscriptions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل جلب الصالونات');
      setSalons(data.salons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleOpenAudit = async (salon: SalonItem) => {
    setAuditSalon(salon);
    setAuditLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${salon.tenant.id}/audit`);
      const data = await res.json();
      setAuditRecords(data.auditTrail || []);
    } catch {
      setAuditRecords([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalSalon) return;

    setModalFeedback(null);
    startActivating(async () => {
      try {
        const res = await fetch(`/api/subscriptions/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: activeModalSalon.tenant.id,
            adminUid: adminUidInput.trim(),
            durationDays,
            planId: selectedPlan,
            note: activationNote.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل التفعيل');

        setModalFeedback({ type: 'success', msg: 'تم تفعيل الاشتراك وتوثيق العملية في سجل التدقيق بنجاح.' });
        setTimeout(() => {
          setActiveModalSalon(null);
          setModalFeedback(null);
          fetchSalons();
        }, 1200);
      } catch (err: any) {
        setModalFeedback({ type: 'error', msg: err.message });
      }
    });
  };

  const filteredSalons = salons.filter((item) => {
    if (statusFilter !== 'ALL') {
      if (item.evaluation.effectiveStatus !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.tenant.name.toLowerCase().includes(q);
      const matchSlug = item.tenant.slug.toLowerCase().includes(q);
      const matchComm = item.tenant.commercialName.toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchComm) return false;
    }
    return true;
  });

  const totalCount = salons.length;
  const trialingCount = salons.filter((s) => s.evaluation.effectiveStatus === 'TRIALING').length;
  const expiredCount = salons.filter((s) => s.evaluation.effectiveStatus === 'EXPIRED').length;
  const activeCount = salons.filter((s) => s.evaluation.effectiveStatus === 'ACTIVE').length;

  return (
    <div dir="rtl" className="w-full space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs">
          <span className="text-xs text-[#54453D]/60 block mb-1">إجمالي الصالونات</span>
          <span className="text-2xl font-bold text-[#54453D]">{totalCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-cyan-200/60 bg-cyan-50/20 shadow-2xs">
          <span className="text-xs text-cyan-800 font-medium block mb-1">فترة التجربة (3 أيام)</span>
          <span className="text-2xl font-bold text-cyan-900">{trialingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200/60 bg-red-50/20 shadow-2xs">
          <span className="text-xs text-red-800 font-medium block mb-1">منتهية بانتظار التفعيل</span>
          <span className="text-2xl font-bold text-red-900">{expiredCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/20 shadow-2xs">
          <span className="text-xs text-emerald-800 font-medium block mb-1">اشتراكات مفعلة</span>
          <span className="text-2xl font-bold text-emerald-900">{activeCount}</span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'TRIALING', label: 'قيد التجربة (TRIALING)' },
            { id: 'EXPIRED', label: 'منتهية (EXPIRED)' },
            { id: 'ACTIVE', label: 'مفعلة (ACTIVE)' },
            { id: 'SUSPENDED', label: 'معلقة (SUSPENDED)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#54453D] text-white shadow-2xs'
                  : 'bg-[#54453D]/5 text-[#54453D]/80 hover:bg-[#54453D]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="بحث باسم الصالون أو النطاق..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-xs rounded-xl border border-[#54453D]/20 focus:outline-none focus:border-[#54453D]"
          />
        </div>
      </div>

      {/* Salons Table / List */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#54453D]/60">
            جاري تحميل سجلات المنشآت والاشتراكات...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">
            خطأ: {error}
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#54453D]/60">
            لا توجد صالونات مطابقة للمعايير المحددة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF9F8] border-b border-[#54453D]/10 text-[#54453D]/70 font-bold">
                <tr>
                  <th className="px-5 py-3">الصالون والنطاق</th>
                  <th className="px-5 py-3">الحالة والفعالية</th>
                  <th className="px-5 py-3">فترة التجربة / السريان</th>
                  <th className="px-5 py-3">الباقة</th>
                  <th className="px-5 py-3 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#54453D]/5">
                {filteredSalons.map((item) => {
                  const effective = item.evaluation.effectiveStatus;
                  return (
                    <tr key={item.tenant.id} className="hover:bg-[#FAF9F8]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#54453D]">{item.tenant.name}</div>
                        <div className="text-[11px] font-mono text-[#54453D]/60">
                          {item.tenant.slug}.rashx.org
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {effective === 'TRIALING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse" />
                            تجربة نشطة ({item.evaluation.remainingTrialHours} س متبقية)
                          </span>
                        ) : effective === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            مفعل ونشط (ACTIVE)
                          </span>
                        ) : effective === 'EXPIRED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200">
                            منتهية التجربة (EXPIRED)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">
                            {effective}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-[#54453D]/80">
                        {item.subscription.status === 'TRIALING' ? (
                          <div>
                            <div>تنتهي: {new Date(item.subscription.trialEndsAt).toLocaleDateString('ar-SA')}</div>
                            <div className="text-[10px] text-[#54453D]/50 font-mono">
                              بدأت: {new Date(item.subscription.trialStartedAt).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        ) : item.subscription.status === 'ACTIVE' && item.subscription.currentPeriodEndsAt ? (
                          <div>
                            <div>حتى: {new Date(item.subscription.currentPeriodEndsAt).toLocaleDateString('ar-SA')}</div>
                            {item.subscription.lastActivationNote && (
                              <div className="text-[10px] text-[#54453D]/50 truncate max-w-[180px]">
                                ملاحظة: {item.subscription.lastActivationNote}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>-</div>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-[#54453D]">
                        {item.subscription.planId || 'STARTER'}
                      </td>

                      <td className="px-5 py-4 text-left space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setActiveModalSalon(item);
                            setSelectedPlan(item.subscription.planId || 'STARTER');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#54453D] text-white text-[11px] font-bold shadow-2xs hover:bg-[#3D322C] transition-colors"
                        >
                          تفعيل يدوي
                        </button>
                        <button
                          onClick={() => handleOpenAudit(item)}
                          className="px-3 py-1.5 rounded-xl border border-[#54453D]/20 text-[#54453D] text-[11px] font-bold hover:bg-[#FAF9F8] transition-colors"
                        >
                          سجل التدقيق
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Activation Modal */}
      {activeModalSalon && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#54453D]/10 shadow-lg text-right">
            <h3 className="text-base font-bold text-[#54453D] mb-1">
              تفعيل اشتراك الصالون يدوياً
            </h3>
            <p className="text-xs text-[#54453D]/60 mb-4">
              منشأة: <span className="font-bold text-[#54453D]">{activeModalSalon.tenant.name}</span> ({activeModalSalon.tenant.slug}.rashx.org)
            </p>

            <form onSubmit={handleActivateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#54453D] mb-1">مدة الاشتراك الممنوحة</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '30 يوم', days: 30 },
                    { label: '90 يوم', days: 90 },
                    { label: '180 يوم', days: 180 },
                    { label: 'سنة (365)', days: 365 },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.days}
                      onClick={() => setDurationDays(preset.days)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        durationDays === preset.days
                          ? 'border-[#54453D] bg-[#54453D] text-white'
                          : 'border-[#54453D]/20 bg-[#FAF9F8] text-[#54453D]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#54453D] mb-1">الباقة المعتمدة</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                >
                  <option value="STARTER">الأساسية (STARTER)</option>
                  <option value="GROWTH">النمو (GROWTH)</option>
                  <option value="ENTERPRISE">المؤسسات (ENTERPRISE)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#54453D] mb-1">ملاحظة التدقيق والاعتماد (داخلية للمنصة)</label>
                <textarea
                  rows={2}
                  value={activationNote}
                  onChange={(e) => setActivationNote(e.target.value)}
                  placeholder="مثال: تم تأكيد السداد بموجب حوالة بنكية رقم #1092 أو عقد سنوي معتمد."
                  className="w-full px-3 py-2 rounded-xl border border-[#54453D]/20 resize-none"
                  required
                />
              </div>

              {modalFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    modalFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {modalFeedback.msg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#54453D]/10">
                <button
                  type="button"
                  onClick={() => setActiveModalSalon(null)}
                  disabled={isActivating}
                  className="px-4 py-2 rounded-xl border border-[#54453D]/20 font-bold text-[#54453D] hover:bg-[#FAF9F8]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isActivating}
                  className="px-6 py-2 rounded-xl bg-[#54453D] text-white font-bold shadow-2xs hover:bg-[#3D322C] disabled:opacity-50"
                >
                  {isActivating ? 'جاري الاعتماد...' : 'تأكيد التفعيل الفوري'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {auditSalon && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#54453D]/10 shadow-lg text-right max-h-[85vh] flex flex-col">
            <h3 className="text-base font-bold text-[#54453D] mb-1">
              سجل تدقيق اشتراك: {auditSalon.tenant.name}
            </h3>
            <p className="text-xs text-[#54453D]/60 mb-4 font-mono">
              {auditSalon.tenant.slug}.rashx.org
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {auditLoading ? (
                <div className="py-8 text-center text-[#54453D]/60">جاري قراءة السجل...</div>
              ) : auditRecords.length === 0 ? (
                <div className="py-8 text-center text-[#54453D]/60">لا توجد سجلات تدقيق سابقة.</div>
              ) : (
                auditRecords.map((rec) => (
                  <div key={rec.id} className="p-3 rounded-xl border border-[#54453D]/10 bg-[#FAF9F8] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#54453D]">{rec.action}</span>
                      <span className="text-[10px] text-[#54453D]/50 font-mono">
                        {new Date(rec.timestamp).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <div className="text-[#54453D]/70 text-[11px]">
                      الحالة: <span className="font-mono">{rec.previousStatus}</span> ➔ <span className="font-mono font-bold">{rec.newStatus}</span>
                      {rec.durationDays ? ` (${rec.durationDays} يوم)` : ''}
                    </div>
                    {rec.note && (
                      <div className="text-[11px] bg-white p-2 rounded-lg border border-[#54453D]/5 text-[#54453D]/90">
                        {rec.note}
                      </div>
                    )}
                    <div className="text-[10px] text-[#54453D]/40 font-mono">
                      بواسطة: {rec.actorUid}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[#54453D]/10 flex justify-end">
              <button
                onClick={() => setAuditSalon(null)}
                className="px-5 py-2 rounded-xl bg-[#54453D] text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
