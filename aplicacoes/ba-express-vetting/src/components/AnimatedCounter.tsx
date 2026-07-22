'use client';

import React, { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import styles from './AnimatedCounter.module.css';

interface AnimatedCounterProps {
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
  delay?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  label,
  suffix = '',
  duration = 2,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
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
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const startDelay = delay * 1000;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;

      const elapsed = currentTime - startTime - startDelay;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setDisplayValue(Math.floor(value * easeOutQuad));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration, delay]);

  return (
    <m.div
      ref={ref}
      className={styles.counter}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <div className={styles.value}>
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className={styles.label}>{label}</div>
      <div className={styles.underline} />
    </m.div>
  );
};
