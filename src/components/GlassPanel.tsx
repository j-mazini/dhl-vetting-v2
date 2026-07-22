'use client';

import type { ReactNode } from 'react';
import styles from './GlassPanel.module.css';

type Props = {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
};

export function GlassPanel({ children, className = '', elevated }: Props) {
  return (
    <div
      className={`${styles.panel} ${elevated ? styles.elevated : ''} ${className}`}
    >
      {children}
    </div>
  );
}
