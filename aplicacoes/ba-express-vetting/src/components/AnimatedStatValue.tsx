'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

function parseStat(value: string): { end: number; suffix: string } {
  const trimmed = value.trim();
  const suffix = trimmed.endsWith('+') ? '+' : '';
  const digits = trimmed.replace(/\D/g, '');
  const end = parseInt(digits, 10) || 0;
  return { end, suffix };
}

function formatDisplay(n: number, end: number) {
  const r = Math.round(n);
  if (end >= 1000) return r.toLocaleString('en-GB');
  return String(r);
}

const COUNT_DURATION_MS = 1800;

export function AnimatedStatValue({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const { end, suffix } = parseStat(value);
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);
  const startedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (end === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reducedRef.current = true;
      setDisplay(end);
      startedRef.current = true;
    }
  }, [end]);

  useEffect(() => {
    if (end === 0 || reducedRef.current) return;

    const el = ref.current;
    if (!el) return;

    const startCountUp = () => {
      setDisplay(0);
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / COUNT_DURATION_MS);
        const eased = 1 - (1 - t) ** 3;
        setDisplay(eased * end);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(end);
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        startCountUp();
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [end]);

  if (end === 0) {
    return (
      <div ref={ref} className={className}>
        {value}
      </div>
    );
  }

  const text = formatDisplay(display, end) + suffix;

  return (
    <div
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {text}
    </div>
  );
}
