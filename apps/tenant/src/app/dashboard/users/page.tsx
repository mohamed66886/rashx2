import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  MembershipRepository,
  InvitationRepository,
  EmployeeRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { InviteUserModal } from './invite-user-modal';
import { MemberActionsRow } from './member-actions-row';
import { RevokeInviteButton } from './revoke-invite-button';
import type { MembershipRole } from '@rashx/database';

export const dynamic = 'force-dynamic';

export default async function UsersAndPermissionsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;

  const membershipRepo = new MembershipRepository();
  const invitationRepo = new InvitationRepository();
  const employeeRepo = new EmployeeRepository();

  const [memberships, invitations, employeesRes] = await Promise.all([
    membershipRepo.listMemberships(tenant.tenantId),
    invitationRepo.listInvitations(tenant.tenantId),
    employeeRepo.listEmployees(tenant.tenantId, { limit: 200, status: 'ACTIVE' }),
  ]);

  const canInvite = hasPermission(membership.role, 'memberships.invite');
  const canManageRoles = hasPermission(membership.role, 'memberships.update_role');
  const canSuspend = hasPermission(membership.role, 'memberships.suspend');

  // Filter employees who do not have a linked user account yet (project minimal non-sensitive option fields)
  const unlinkedEmployees = employeesRes.employees
    .filter((e) => !e.linkedUid)
    .map((e) => ({
      id: e.id,
      fullNameAr: e.fullNameAr,
      employeeNumber: e.employeeNumber,
      jobTitle: e.jobTitle,
    }));

  const roleLabels: Record<MembershipRole, { label: string; bg: string; textCol: string; border: string }> = {
    OWNER: { label: 'مالك المنشأة (Owner)', bg: 'bg-amber-100', textCol: 'text-amber-900', border: 'border-amber-300' },
    MANAGER: { label: 'مدير الصالون (Manager)', bg: 'bg-[#91B8C0]/20', textCol: 'text-[#2C4349]', border: 'border-[#91B8C0]/40' },
    STAFF: { label: 'فريق العمل (Staff)', bg: 'bg-[#FAF9F8]', textCol: 'text-[#54453D]', border: 'border-[#54453D]/10' },
  };

  const pendingInvitations = invitations.filter((inv) => inv.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>🔐</span> المستخدمون والصلاحيات وإدارة الوصول
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            إدارة حسابات الدخول، تعيين أدوار المديرين والموظفين، وحماية صلاحيات المالك الحصرية.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canInvite && <InviteUserModal unlinkedEmployees={unlinkedEmployees} />}
        </div>
      </div>

      {/* Active Members Table */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#54453D]/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
            <span>👥</span> أعضاء المنظمة والحسابات النشطة ({memberships.length})
          </h3>
          <span className="text-xs text-[#54453D]/60 font-medium">
            حماية كاملة لقاعدة المالك الواحد (Single-Owner Invariant)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF9F8] border-b border-[#54453D]/10 text-[#54453D]/80 font-bold">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">الدور الوظيفي والصلاحية</th>
                <th className="p-4">تاريخ الانضمام</th>
                <th className="p-4">حالة الحساب</th>
                <th className="p-4 text-left">إدارة العضوية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#54453D]/5">
              {memberships.map((m) => {
                const roleConfig = roleLabels[m.role];
                return (
                  <tr key={m.id} className="hover:bg-[#FAF9F8]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#54453D]/10 text-[#54453D] font-bold flex items-center justify-center text-xs">
                          {m.title ? m.title.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#54453D] font-mono">{m.id}</p>
                          {m.title && (
                            <p className="text-[10px] text-[#54453D]/60">{m.title}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleConfig.bg} ${roleConfig.textCol} ${roleConfig.border}`}
                      >
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#54453D]/70">
                      {m.joinedAt ? m.joinedAt.split('T')[0] : '—'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {m.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <MemberActionsRow
                        member={m}
                        currentUid={session.user.uid}
                        canManageRoles={canManageRoles}
                        canSuspend={canSuspend}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#54453D]/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
              <span>✉️</span> الدعوات المعلقة بانتظار القبول ({pendingInvitations.length})
            </h3>
            <span className="text-xs text-[#54453D]/60 font-medium">
              تنتهي صلاحية كل دعوة تلقائياً بعد ٧ أيام من تاريخ إصدارها
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF9F8] border-b border-[#54453D]/10 text-[#54453D]/80 font-bold">
                <tr>
                  <th className="p-4">البريد الإلكتروني</th>
                  <th className="p-4">الدور المعين</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#54453D]/5">
                {pendingInvitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAF9F8]/50">
                    <td className="p-4 font-mono font-bold text-[#54453D]">{inv.email}</td>
                    <td className="p-4 font-bold text-[#2C4349]">
                      {inv.role === 'MANAGER' ? 'مدير صالون' : 'فريق عمل'}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#54453D]/60">
                      {inv.expiresAt.split('T')[0]}
                    </td>
                    <td className="p-4">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        بانتظار القبول
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <RevokeInviteButton invitationId={inv.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
