'use client';

import { useState } from 'react';
import type { MembershipDoc, MembershipRole } from '@rashx/database';
import { updateMemberRoleAction, suspendMemberAction, reactivateMemberAction } from './actions';

export function MemberActionsRow({
  member,
  currentUid,
  canManageRoles,
  canSuspend,
}: {
  member: MembershipDoc;
  currentUid: string;
  canManageRoles: boolean;
  canSuspend: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = member.id === currentUid;
  const isOwner = member.role === 'OWNER';

  async function handleRoleChange(newRole: MembershipRole) {
    if (newRole === member.role) return;
    setLoading(true);
    setError(null);

    const res = await updateMemberRoleAction(member.id, newRole);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'فشل تعديل الدور');
    }
  }

  async function handleToggleSuspend() {
    setLoading(true);
    setError(null);

    const res =
      member.status === 'SUSPENDED'
        ? await reactivateMemberAction(member.id)
        : await suspendMemberAction(member.id);

    setLoading(false);
    if (!res.success) {
      setError(res.error || 'فشل تحديث حالة العضوية');
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      {error && <span className="text-[10px] text-red-600 font-bold">{error}</span>}

      {/* Role Selection Dropdown (Gated and disabled for OWNER or unauthorized) */}
      {canManageRoles && !isOwner && !isSelf ? (
        <select
          disabled={loading}
          value={member.role}
          onChange={(e) => handleRoleChange(e.target.value as MembershipRole)}
          className="text-xs px-2.5 py-1 rounded-lg border border-[#54453D]/20 bg-white font-medium"
        >
          <option value="STAFF">عضو فريق عمل (Staff)</option>
          <option value="MANAGER">مدير صالون (Manager)</option>
        </select>
      ) : null}

      {/* Suspend / Reactivate Button */}
      {canSuspend && !isOwner && !isSelf ? (
        <button
          type="button"
          disabled={loading}
          onClick={handleToggleSuspend}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
            member.status === 'SUSPENDED'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }`}
        >
          {member.status === 'SUSPENDED' ? 'تنشيط الحساب' : 'تجميد'}
        </button>
      ) : null}

      {isOwner && (
        <span className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
          محمي (مالك المنشأة)
        </span>
      )}

      {isSelf && !isOwner && (
        <span className="text-[10px] text-[#54453D]/60 font-medium">حسابك الحالي</span>
      )}
    </div>
  );
}

