'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth, signOut } from '@/lib/firebase-client';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        const auth = getFirebaseAuth();
        await signOut(auth);
      } catch {
        // Continue even if client call fails
      }
      router.push('/login');
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
    >
      {isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
    </button>
  );
}

