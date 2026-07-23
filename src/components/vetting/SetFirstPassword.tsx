'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './SetFirstPassword.module.css';

interface SetFirstPasswordProps {
  onBack?: () => void;
}

export function SetFirstPassword({ onBack }: SetFirstPasswordProps) {
  const { completeFirstAccess, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await completeFirstAccess(email, tempPassword, newPassword);
      router.push('/vetting/dashboard');
    } catch (err) {
      let errorMessage = 'Failed to set password. Please try again.';

      if (err instanceof Error) {
        switch ((err as any).code) {
          case 'first-access/not-found':
            errorMessage = 'No first access code found for this email.';
            break;
          case 'first-access/used':
            errorMessage = 'This access code has already been used.';
            break;
          case 'first-access/expired':
            errorMessage = 'This access code has expired.';
            break;
          case 'first-access/invalid-code':
            errorMessage = 'The temporary password is incorrect.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered.';
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          {onBack && (
            <button onClick={onBack} className={styles.backButton} disabled={isLoading}>
              ← Back
            </button>
          )}
          <h1 className={styles.title}>Set Your Password</h1>
          <p className={styles.subtitle}>
            Create your permanent password using the temporary code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="tempPassword" className={styles.label}>
              Temporary Password
            </label>
            <input
              id="tempPassword"
              type="password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className={styles.input}
            />
            <small className={styles.hint}>Check your email for this code</small>
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className={styles.input}
            />
            <small className={styles.hint}>At least 8 characters</small>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={isLoading} className={styles.submit}>
            {isLoading ? 'Setting Password...' : 'Set Password & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
