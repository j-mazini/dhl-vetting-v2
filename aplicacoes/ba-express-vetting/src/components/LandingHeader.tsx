'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import styles from './LandingHeader.module.css';

/** Offset for fixed navbar when scrolling to anchors */
const SCROLL_OFFSET = 84;

const NAV_LINKS = [
  { id: 'fleet', label: 'Our fleet' },
  { id: 'partners', label: 'Partners' },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y =
      el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }, []);

  return (
    <m.header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.logoBtn}
          onClick={() => go('home')}
          aria-label="BA Express Ltd — Home"
        >
          <Image
            src="/assets/logo-ba.png"
            alt="BA Express Ltd."
            width={420}
            height={100}
            className={styles.logoImg}
            priority
            sizes="(max-width: 768px) 78vw, 420px"
          />
        </button>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              className={styles.navLink}
              onClick={() => go(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/apply" className={styles.cta}>
            Apply to Drive
          </Link>
        </div>
      </div>
    </m.header>
  );
}
