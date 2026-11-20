'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export interface ParallaxProps {
  children: ReactNode;
  /** سرعة الحركة: موجب = أبطأ من الاسكرول، سالب = أسرع. جرّب 0.1 – 0.3 */
  speed?: number;
  className?: string;
}

/**
 * Parallax خفيف على الاسكرول (rAF + transform فقط، بدون layout thrash).
 * مناسب للصور الخلفية والأشكال الزخرفية في الـ Hero.
 */
export function Parallax({ children, speed = 0.15, className = '' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
