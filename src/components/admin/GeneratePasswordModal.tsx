'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { m } from 'framer-motion';
import styles from './GeneratePasswordModal.module.css';

interface GeneratePasswordModalProps {
  isOpen: boolean;
  candidateEmail?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GeneratePasswordModal({
  isOpen,
  candidateEmail = '',
  onClose,
  onSuccess,
}: GeneratePasswordModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(candidateEmail);
  const [manualPassword, setManualPassword] = useState('');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    email: string;
    temporaryPassword?: string;
    expiresAt: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (mode === 'manual' && manualPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const idToken = await (user as any).getIdToken?.();
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      const response = await fetch('/api/admin/generate-first-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          expiresInHours: 24,
          temporaryPassword: mode === 'manual' ? manualPassword : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }

      setResult({
        email: data.email,
        temporaryPassword: data.temporaryPassword,
        expiresAt: data.expiresAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <m.div
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Generate Temporary Password</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {!result ? (
          <>
            <div className={styles.modeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${mode === 'auto' ? styles.modeBtnActive : ''}`}
                onClick={() => {
                  setMode('auto');
                  setManualPassword('');
                }}
                disabled={loading}
              >
                Auto Generate
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${mode === 'manual' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('manual')}
                disabled={loading}
              >
                Manual Password
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.com"
                  required
                  disabled={loading}
                  className={styles.input}
                />
              </div>

              {mode === 'manual' && (
                <div className={styles.field}>
                  <label htmlFor="password">Temporary Password</label>
                  <input
                    id="password"
                    type="password"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Enter password (min 6 chars)"
                    required={mode === 'manual'}
                    disabled={loading}
                    className={styles.input}
                  />
                </div>
              )}

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" disabled={loading} className={styles.submit}>
                {loading ? 'Generating...' : 'Generate Code'}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h3>Password Generated</h3>
            <div className={styles.resultField}>
              <label>Email</label>
              <div className={styles.resultValue}>{result.email}</div>
            </div>
            {result.temporaryPassword && (
              <div className={styles.resultField}>
                <label>Temporary Password</label>
                <div className={styles.resultValue}>{result.temporaryPassword}</div>
              </div>
            )}
            <div className={styles.resultField}>
              <label>Expires</label>
              <div className={styles.resultValue}>
                {new Date(result.expiresAt).toLocaleString()}
              </div>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.submitClose}
                onClick={() => {
                  setResult(null);
                  setEmail('');
                  setManualPassword('');
                  onSuccess?.();
                  onClose();
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </m.div>
    </div>
  );
}
