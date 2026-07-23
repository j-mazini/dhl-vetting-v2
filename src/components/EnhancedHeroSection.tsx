'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { AnimatedButton } from './AnimatedButton';
import { GradientText } from './GradientText';
import { images } from '@/content/images';
import styles from './EnhancedHeroSection.module.css';

export function EnhancedHeroSection() {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.backgroundEffects}>
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.glowOrb3} />
      </div>

      <m.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.contentGrid}>
          {/* Left Content */}
          <m.div className={styles.content} variants={itemVariants}>
            <m.h1 className={styles.title} variants={itemVariants}>
              DHL Vetting <GradientText gradient="primary">Tracker</GradientText>
            </m.h1>

            <m.p className={styles.subtitle} variants={itemVariants}>
              Streamline your driver vetting process with our comprehensive platform.
              Automated checks, secure document management, and real-time assessments.
            </m.p>

            <m.div className={styles.actions} variants={itemVariants}>
              <AnimatedButton variant="primary" size="lg" href="/vetting/register">
                Apply to Drive
              </AnimatedButton>
              <AnimatedButton variant="secondary" size="lg" href="#features">
                Learn More
              </AnimatedButton>
            </m.div>

            <m.div className={styles.features} variants={itemVariants}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <span>Quick assessment</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <span>Secure documents</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <span>Real-time updates</span>
              </div>
            </m.div>
          </m.div>

          {/* Right Image */}
          <m.div className={styles.imageWrapper} variants={itemVariants}>
            <div className={styles.imageContainer}>
              <Image
                src={images.gemini}
                alt="BA Express Delivery Service"
                fill
                className={styles.image}
                priority
              />
              <div className={styles.imageBorder} />
            </div>

            {/* Floating Stats */}
            <m.div
              className={styles.stat}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className={styles.statValue}>500+</div>
              <div className={styles.statLabel}>Deliveries Daily</div>
            </m.div>

            <m.div
              className={`${styles.stat} ${styles.stat2}`}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <div className={styles.statValue}>99%</div>
              <div className={styles.statLabel}>On-Time Rate</div>
            </m.div>
          </m.div>
        </div>
      </m.div>
    </section>
  );
}
