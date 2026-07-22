'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

function authErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead.';
    case 'first-access/not-found':
      return 'No first access invitation was found for this email.';
    case 'first-access/used':
      return 'This temporary password has already been used. Sign in with your password.';
    case 'first-access/expired':
      return 'This temporary password has expired. Please contact BA Express.';
    case 'first-access/invalid-code':
      return 'Temporary password is incorrect.';
    case 'first-access/misconfigured':
      return 'First access is not configured correctly. Please contact BA Express.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

export default function LoginPage() {
  const { user, isAuthenticated, loading, signInWithGoogle, signInWithEmail, completeFirstAccess } =
    useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'firstAccess'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace(user.isAdmin ? '/admin/vetting' : '/vetting/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  const handleLogin = async () => {
    setError('');
    setSigningIn(true);
    try {
      const { isAdmin } = await signInWithGoogle();
      router.replace(isAdmin ? '/admin/vetting' : '/vetting/dashboard');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'firstAccess' && password !== confirmPassword) {
        setError('New password and confirmation do not match.');
        setSubmitting(false);
        return;
      }

      const { isAdmin } = mode === 'signin'
        ? await signInWithEmail(email, password)
        : await completeFirstAccess(email, temporaryPassword, password);
      router.replace(isAdmin ? '/admin/vetting' : '/vetting/dashboard');
    } catch (err: any) {
      setError(authErrorMessage(err?.code ?? ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Navbar */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image src="https://baexpress.co.uk/assets/logo-ba.png" alt="BA Express" width={44} height={44} unoptimized />
          <span className={styles.brandName}>BA Express</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/#arrivals" className={styles.navLink}>About</Link>
          <Link href="/#standards" className={styles.navLink}>Standards</Link>
          <Link href="/#fleet" className={styles.navLink}>Fleet</Link>
          <Link href="/#boarding" className={styles.navLink}>Apply</Link>
        </nav>
      </header>

      {/* Main */}
      <div className={styles.main}>

        {/* Left — hero copy */}
        <div className={styles.hero}>
          <div className={styles.eyebrow}>
            <div className={styles.eyebrowLine} />
            <span className={styles.eyebrowText}>DHL Partner — Vetting Portal</span>
          </div>
          <h1 className={styles.heroTitle}>
            TAILORED<br />
            <span className={styles.heroAccent}>JOURNEYS,</span><br />
            DELIVERED<br />
            EXCELLENCE
          </h1>
          <p className={styles.heroSub}>
            Last-mile logistics across Central London, Greater London and Kent.
            Join our team as a driver partner.
          </p>
        </div>

        {/* Right — login card */}
        <div className={styles.cardWrap}>
          <div className={styles.card}>
            <div className={styles.mobileLogo}>
              <Image src="https://baexpress.co.uk/assets/logo-ba.png" alt="BA Express" width={52} height={52} unoptimized />
            </div>

            <h2 className={styles.cardTitle}>
              {mode === 'signin' ? 'Access the portal' : 'First access'}
            </h2>
            <p className={styles.cardSub}>
              {mode === 'signin'
                ? 'Sign in with your email or Google account'
                : 'Use the temporary password sent by BA Express, then create your own password'}
            </p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={styles.input}
                />
              </div>
              {mode === 'firstAccess' && (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="temporaryPassword">Temporary password</label>
                  <input
                    id="temporaryPassword"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    placeholder="ABCD-2345-EFGH"
                    className={styles.input}
                  />
                </div>
              )}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  {mode === 'signin' ? 'Password' : 'New password'}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.input}
                />
              </div>
              {mode === 'firstAccess' && (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="confirmPassword">Confirm new password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                  />
                </div>
              )}
              <button type="submit" disabled={submitting} className={styles.primaryButton}>
                {submitting && <span className={styles.buttonSpinner} />}
                {submitting
                  ? 'Please wait...'
                  : mode === 'signin'
                    ? 'Sign in'
                    : 'Create password'}
              </button>
            </form>

            <p className={styles.toggleRow}>
              {mode === 'signin' ? (
                <>
                  First time here?{' '}
                  <button
                    type="button"
                    className={styles.toggleLink}
                    onClick={() => { setMode('firstAccess'); setError(''); setPassword(''); }}
                  >
                    Use first access
                  </button>
                </>
              ) : (
                <>
                  Already created your password?{' '}
                  <button
                    type="button"
                    className={styles.toggleLink}
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setTemporaryPassword('');
                      setConfirmPassword('');
                      setPassword('');
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              or
              <span className={styles.dividerLine} />
            </div>

            <button onClick={handleLogin} disabled={signingIn} className={styles.googleButton}>
              {signingIn ? <span className={styles.buttonSpinner} /> : <GoogleIcon />}
              {signingIn ? 'Signing in...' : 'Continue with Google'}
            </button>

            <Link href="/apply" className={styles.applyButton}>
              I want to apply
            </Link>
          </div>
        </div>
      </div>

      {/* Steps bar */}
      <div className={styles.steps}>
        <div className={styles.stepsInner}>
          {[
            { num: '01', label: 'Pre-registration', desc: 'Initial application form' },
            { num: '02', label: 'Documents',        desc: 'DBS, references, RtW' },
            { num: '03', label: 'Interview',        desc: 'BA Express assessment' },
            { num: '04', label: 'DHL Approval',     desc: 'Final credentialing' },
          ].map((step) => (
            <div key={step.num} className={styles.step}>
              <span className={styles.stepNum}>{step.num}</span>
              <div>
                <p className={styles.stepLabel}>{step.label}</p>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
