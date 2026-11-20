'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface HeaderShellProps {
  children: ReactNode;
  dir: 'rtl' | 'ltr';
  className?: string;
}

/**
 * Scroll-aware header wrapper:
 *  - يصغّر الهيدر ويضيف blur/خلفية بعد أول سكرول
 *  - يختفي عند النزول ويرجع عند الطلوع (smart hide)
 *  - شريط تقدّم القراءة (scroll progress) أعلى الصفحة
 * children بتقدر تقرأ الحالة عن طريق: group-data-[scrolled=true]/hdr:...
 */
export function HeaderShell({ children, dir, className }: HeaderShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (barRef.current) {
        const p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
        barRef.current.style.transform = `scaleX(${p})`;
      }

      setScrolled(y > 8);

      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 220);
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <header
      dir={dir}
      data-scrolled={scrolled}
      data-hidden={hidden}
      className={`group/hdr rx-header-in sticky top-0 z-40 transition-[transform,background-color,backdrop-filter] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl'
          : 'bg-white/0 backdrop-blur-0'
      } ${hidden ? '-translate-y-full' : 'translate-y-0'} ${className ?? ''}`}
    >
      {children}

      {/* Scroll progress */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-[2px] transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          ref={barRef}
          className="h-full w-full bg-[#F0C5AE] will-change-transform"
          style={{
            transform: 'scaleX(0)',
            transformOrigin: dir === 'rtl' ? 'right' : 'left',
          }}
        />
      </div>
    </header>
  );
}
