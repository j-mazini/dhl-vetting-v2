'use client';

import { useState } from 'react';
import styles from './FleetSpotlight.module.css';

type Item = {
  id: string;
  title: string;
  badge: string;
  body: string;
};

type Props = {
  items: readonly Item[];
};

export function FleetSpotlight({ items }: Props) {
  const [active, setActive] = useState(0);
  const current = items[active];
  if (!current) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.chips} role="group" aria-label="Fleet highlights">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.chip} ${i === active ? styles.chipActive : ''}`}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className={styles.detail}>
        <span className={styles.badge}>{current.badge}</span>
        <p className={styles.body}>{current.body}</p>
      </div>
    </div>
  );
}
