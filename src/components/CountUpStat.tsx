'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpStatProps {
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
}

export function CountUpStat({
  value,
  label,
  suffix = '',
  duration = 2000,
}: CountUpStatProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCount(Math.floor(value * progress));

      if (progress >= 1) {
        clearInterval(interval);
        setCount(value);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isVisible, value, duration]);

  return (
    <div
      ref={ref}
      className="text-center p-4 md:p-6 rounded-lg bg-gradient-to-br from-white/95 to-gray-50 backdrop-blur-sm border border-black/5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="text-3xl md:text-4xl font-black font-display text-text-primary mb-2">
        {count.toLocaleString()}
        {suffix}
      </div>
      <p className="text-sm md:text-base text-text-secondary">{label}</p>
    </div>
  );
}
