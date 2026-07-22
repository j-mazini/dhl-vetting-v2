'use client';

import React from 'react';
import { m } from 'framer-motion';
import styles from './AnimatedCard.module.css';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  href?: string;
  interactive?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  icon,
  title,
  description,
  href,
  interactive = true,
}) => {
  const cardVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
      },
    },
    hover: interactive ? { y: -8, scale: 1.02 } : {},
  };

  const Component = href ? 'a' : 'div';
  const props = href ? { href } : {};

  return (
    <m.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover={interactive ? 'hover' : undefined}
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      className={`${styles.card} ${className}`}
      {...props}
    >
      {icon && <div className={styles.iconWrapper}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {children}
      <div className={styles.glowEffect} />
    </m.div>
  );
};
