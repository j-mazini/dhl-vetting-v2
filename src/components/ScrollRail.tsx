'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './ScrollRail.module.css';

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'why', label: 'Why' },
  { id: 'services', label: 'Services' },
  { id: 'stats', label: 'Impact' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'area', label: 'Area' },
  { id: 'contact', label: 'Apply' },
  { id: 'customers', label: 'Clients' },
] as const;

const RAIL_SCROLL_OFFSET = 84;

export function ScrollRail() {
  const { user, isAuthenticated, hasCandidateRecord, recordLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const showApplication =
    !isAuthenticated ||
    (!recordLoading && !user?.isAdmin && hasCandidateRecord === false);
  const sections = showApplication
    ? SECTIONS
    : SECTIONS.filter((section) => section.id !== 'contact');

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y =
      el.getBoundingClientRect().top + window.scrollY - RAIL_SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setProgress(1);
        return;
      }
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section, index) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting && e.intersectionRatio >= 0.2) {
              setActive(index);
            }
          }
        },
        { root: null, rootMargin: '-18% 0px -40% 0px', threshold: [0, 0.2, 0.45] },
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [showApplication]);

  return (
    <aside className={styles.rail} aria-label="Section navigation">
      <div className={styles.railBox}>
        <div
          className={styles.progressTrack}
          style={{ transform: `scaleY(${progress})` }}
          aria-hidden
        />
        <ul className={styles.list}>
          {sections.map((section, i) => (
            <li key={section.id}>
              <button
                type="button"
                className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                onClick={() => scrollToSection(section.id)}
                aria-current={i === active ? 'true' : undefined}
                aria-label={`Go to ${section.label}`}
              >
                <span className={styles.dotIndicator} aria-hidden="true" />
                <span className={styles.label}>{section.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
