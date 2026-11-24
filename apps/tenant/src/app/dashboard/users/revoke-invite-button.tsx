'use client';

import { useState } from 'react';
import { revokeInvitationAction } from './actions';

export function RevokeInviteButton({ invitationId }: { invitationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    if (!confirm('هل أنت متأكد من إلغاء هذه الدعوة؟ لن يتمكن المدعو من استخدام الرابط بعد ذلك.')) {
      return;
    }

    setLoading(true);
    await revokeInvitationAction(invitationId);
    setLoading(false);
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
    >
      {loading ? 'جاري الإلغاء...' : 'إلغاء الدعوة'}
    </button>
  );
}

