'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { m } from 'framer-motion';
import styles from './SetNewPasswordModal.module.css';

interface SetNewPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SetNewPasswordModal({ isOpen, onClose, onSuccess }: SetNewPasswordModalProps) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Password is required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (!user) throw new Error('User not authenticated');

      // Update password using Firebase Auth
      await (user as any).updatePassword?.(newPassword);

      setNewPassword('');
      setConfirmPassword('');
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <m.div
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className={styles.title}>Set Your Password</h2>
        <p className={styles.subtitle}>
          Create a permanent password for your account
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
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
              disabled={loading}
              className={styles.input}
              autoFocus
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
              disabled={loading}
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>

        <p className={styles.info}>
          You can change this password anytime in your account settings.
        </p>
      </m.div>
    </div>
  );
}
