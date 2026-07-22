'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PreRegistrationForm } from '@/components/vetting/PreRegistrationForm';
import styles from '../vetting/register/page.module.css';

function ApplyContent() {
  const { user, isAuthenticated, hasCandidateRecord, recordLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || recordLoading) return;
    if (user?.isAdmin) {
      router.replace('/admin/vetting');
    } else if (hasCandidateRecord) {
      router.replace('/vetting/dashboard');
    }
  }, [hasCandidateRecord, isAuthenticated, recordLoading, router, user]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <Image src="/assets/logo-ba.png" alt="BA Express" width={84} height={84} />
            <span>BA Express</span>
          </Link>
          <div className={styles.headerLinks}>
            <Link href="/vetting" className={styles.portalLink}>
              My Vetting
            </Link>
            <Link href="/" className={styles.backLink}>
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.eyebrow}>
            <div className={styles.eyebrowLine} />
            <span className={styles.eyebrowText}>Driver Application</span>
          </div>
          <h1 className={styles.title}>
            Apply to become a <span className={styles.titleAccent}>driver partner</span>
          </h1>
          <p className={styles.intro}>
            Share your details so our team can create your candidate record and begin
            the BA Express vetting process.
          </p>
        </section>

        <div className={styles.shell}>
          <section className={styles.formCard}>
            <PreRegistrationForm />
          </section>

          <aside className={styles.sideCard}>
            <h2 className={styles.sideTitle}>Before you start</h2>
            <div className={styles.sideList}>
              <div className={styles.sideItem}>
                <span className={styles.sideDot} />
                <span>Use the same email you will use to access the driver portal.</span>
              </div>
              <div className={styles.sideItem}>
                <span className={styles.sideDot} />
                <span>Have your right-to-work and driving licence details ready.</span>
              </div>
              <div className={styles.sideItem}>
                <span className={styles.sideDot} />
                <span>Your application will appear in the admin vetting dashboard.</span>
              </div>
            </div>

            <div className={styles.sideCta}>
              <p className={styles.sideCtaText}>
                Already applied? Sign in to track your vetting progress.
              </p>
              <Link href="/vetting" className={styles.sideCtaButton}>
                Go to My Vetting →
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <AuthProvider>
      <ApplyContent />
    </AuthProvider>
  );
}
