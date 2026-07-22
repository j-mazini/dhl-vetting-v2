'use client';

import React from 'react';
import { m } from 'framer-motion';
import styles from './AnimatedButton.module.css';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimatedButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  AnimatedButtonProps
>(
  (
    { children, onClick, href, variant = 'primary', size = 'md', className = '' },
    ref
  ) => {
    const Component = href ? 'a' : 'button';
    const variantClass = styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
    const sizeClass = styles[`size${size.toUpperCase()}`];

    return (
      <m.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${styles.buttonWrapper} ${className}`}
      >
        <Component
          ref={ref as any}
          onClick={onClick}
          href={href}
          className={`${styles.button} ${variantClass} ${sizeClass}`}
        >
          <span className={styles.content}>{children}</span>
          <span className={styles.shine} />
        </Component>
      </m.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
