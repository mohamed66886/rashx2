'use client';

import { Button } from '@rashx/ui';
import { Sparkles } from '@rashx/icons';

export function LoaderReplayButton({ isAr }: { isAr: boolean }) {
  return (
    <Button
      size="lg"
      className="bg-[#F0C5AE] text-[#54453D] hover:bg-[#E4A889] font-bold"
      onClick={() => {
        if (typeof window !== 'undefined') {
          const api = (window as unknown as { RashxLoader?: { replay: () => void } }).RashxLoader;
          if (api?.replay) {
            api.replay();
          }
        }
      }}
    >
      <Sparkles className="h-4 w-4 text-[#54453D]" />
      <span>{isAr ? 'شغّل شاشة التحميل الآن (Replay)' : 'Replay Brand Loader Now'}</span>
    </Button>
  );
}

