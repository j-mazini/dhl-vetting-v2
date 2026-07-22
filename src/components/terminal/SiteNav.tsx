'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Theme = 'dark' | 'light';
const THEME_KEY = 'ba-theme';

function formatLondon(now: Date) {
  const time = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false });
  const date = now
    .toLocaleDateString('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
  return { time, date };
}

/** Terminal ("/") page chrome: brand + theme select + live London clock. */
export function SiteNav() {
  const [clock, setClock] = useState({ time: '--:--:--', date: '—' });
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const tick = () => setClock(formatLondon(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <header id="topbar">
      <Link className="brand" href="/">
        <span className="roundel">BA</span>EXPRESS
      </Link>
      <nav className="topbar-nav" aria-label="BA Express site and vetting links">
        <a href="#standards">STANDARDS</a>
        <a href="#coverage">COVERAGE</a>
      </nav>
      <div className="topbar-right">
        <Link className="topbar-cta" href="/vetting/register">
          APPLY TO DRIVE
        </Link>
        <select
          className="theme-select"
          aria-label="Colour mode"
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
        >
          <option value="dark">DARK</option>
          <option value="light">LIGHT</option>
        </select>
        <div id="clock">
          <span className="date">{clock.date}</span>
          <span>{clock.time}</span>
          <span className="lon">LON</span>
        </div>
      </div>
    </header>
  );
}
