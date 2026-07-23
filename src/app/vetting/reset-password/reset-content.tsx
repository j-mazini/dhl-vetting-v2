'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import styles from './page.module.css';

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function validateCode() {
      if (!code) {
        setError('Invalid or missing reset code');
        setIsLoading(false);
        return;
      }

      try {
        const resetDoc = await getDoc(doc(db, 'passwordResetTokens', code));

        if (!resetDoc.exists()) {
          setError('Reset link not found or has expired');
          setIsLoading(false);
          return;
        }

        const data = resetDoc.data();

        if (data.used) {
          setError('This reset link has already been used');
          setIsLoading(false);
          return;
        }

        if (data.expiresAt.toMillis && data.expiresAt.toMillis() < Date.now()) {
          setError('Reset link has expired');
          setIsLoading(false);
          return;
        }

        setEmail(data.email);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to validate reset link');
        setIsLoading(false);
      }
    }

    validateCode();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Update user password
      const user = auth.currentUser;
      if (!user || user.email?.toLowerCase() !== email.toLowerCase()) {
        throw new Error('Session expired. Please log in first.');
      }

      await updatePassword(user, password);

      // Mark token as used
      if (code) {
        await updateDoc(doc(db, 'passwordResetTokens', code), {
          used: true,
          usedAt: Timestamp.now(),
        });
      }

      // Redirect to login
      router.push('/vetting/login?reset=success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading && !email) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid Reset Link</h1>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => router.push('/vetting/forgot-password')}
            className={styles.backButton}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>Create a new password for your account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
