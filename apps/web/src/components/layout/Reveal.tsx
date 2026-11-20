'use client';

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

type Variant = 'up' | 'down' | 'fade' | 'scale' | 'start' | 'end' | 'blur';

const HIDDEN: Record<Variant, string> = {
  up: 'opacity-0 translate-y-10',
  down: 'opacity-0 -translate-y-10',
  fade: 'opacity-0',
  scale: 'opacity-0 scale-90',
  // start/end يحترموا RTL/LTR تلقائياً
  start: 'opacity-0 ltr:-translate-x-12 rtl:translate-x-12',
  end: 'opacity-0 ltr:translate-x-12 rtl:-translate-x-12',
  blur: 'opacity-0 blur-md translate-y-6',
};

export interface RevealProps {
  children: ReactNode;
  variant?: Variant;
  /** تأخير بالمللي ثانية (للـ stagger استخدم index * 80) */
  delay?: number;
  /** مدة الحركة بالمللي ثانية */
  duration?: number;
  /** يشتغل مرة واحدة بس (الافتراضي) أو كل مرة يدخل الشاشة */
  once?: boolean;
  threshold?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}

/**
 * Scroll-reveal: العنصر بيظهر بأنيميشن لما يدخل الشاشة.
 * بيحترم prefers-reduced-motion.
 *
 * <Reveal variant="up" delay={i * 80}>...</Reveal>
 */
export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = 800,
  once = true,
  threshold = 0.15,
  as = 'div',
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  const style: CSSProperties = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  return createElement(
    as,
    {
      ref,
      style,
      className: `transition-[opacity,transform,filter] ease-[cubic-bezier(.22,1,.36,1)] will-change-transform motion-reduce:!translate-x-0 motion-reduce:!translate-y-0 motion-reduce:!scale-100 motion-reduce:!opacity-100 motion-reduce:!blur-0 motion-reduce:transition-none ${
        shown ? 'opacity-100 translate-x-0 translate-y-0 scale-100 blur-0' : HIDDEN[variant]
      } ${className}`,
    },
    children,
  );
}
