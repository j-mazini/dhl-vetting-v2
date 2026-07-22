'use client';

import { useCallback, useId, useState } from 'react';
import styles from './ServiceTabs.module.css';

type Tab = { id: string; title: string; body: string };

type Props = {
  tabs: readonly Tab[];
  className?: string;
};

export function ServiceTabs({ tabs, className }: Props) {
  const baseId = useId();
  const [active, setActive] = useState(0);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActive((i) => (i + 1) % tabs.length);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActive((i) => (i - 1 + tabs.length) % tabs.length);
      }
    },
    [tabs.length],
  );

  const t = tabs[active];
  if (!t) return null;

  return (
    <div
      className={`${styles.wrap} ${className ?? ''}`.trim()}
      onKeyDown={onKeyDown}
    >
      <div
        className={styles.tabList}
        role="tablist"
        aria-label="Service highlights"
      >
        {tabs.map((tab, i) => {
          const selected = i === active;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.tabActive : ''}`}
              onClick={() => setActive(i)}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
      <div
        id={`${baseId}-panel-${t.id}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${t.id}`}
        className={styles.panel}
      >
        <p className={styles.panelText}>{t.body}</p>
      </div>
    </div>
  );
}
