'use client';

import React from 'react';
import { m } from 'framer-motion';
import styles from './GradientText.module.css';

interface GradientTextProps {
  children: string;
  className?: string;
  gradient?: 'primary' | 'secondary' | 'accent';
  animated?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  gradient = 'primary',
  animated = true,
}) => {
  const gradientClass = styles[`gradient${gradient.charAt(0).toUpperCase() + gradient.slice(1)}`];

  if (!animated) {
    return <span className={`${styles.text} ${gradientClass} ${className}`}>{children}</span>;
  }

  const textVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
      },
    }),
  };

  const words = children.split(' ');

  return (
    <span className={`${styles.text} ${gradientClass} ${className}`}>
      {words.map((word, i) => (
        <m.span
          key={`${word}-${i}`}
          custom={i}
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </m.span>
      ))}
    </span>
  );
};
