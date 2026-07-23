'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import styles from './GenerateFirstAccessCode.module.css';

export function GenerateFirstAccessCode() {
  const { user, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [email, setEmail] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [expiresInHours, setExpiresInHours] = useState('24');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{
    email: string;
    temporaryPassword?: string;
    expiresAt: string;
  } | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      setError('You do not have permission to access this feature.');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setResult(null);

    if (mode === 'manual' && manualPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Get ID token
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
          expiresInHours: parseInt(expiresInHours),
          temporaryPassword: mode === 'manual' ? manualPassword : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }

      setSuccess(true);
      setResult({
        email: data.email,
        temporaryPassword: data.temporaryPassword,
        expiresAt: data.expiresAt,
      });
      setEmail('');
      setManualPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Access Denied</h1>
          <p className={styles.error}>Only administrators can access this feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Generate First Access Code</h1>
        <p className={styles.subtitle}>
          Create a temporary password for new drivers to set up their accounts
        </p>

        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'auto' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setMode('auto');
              setManualPassword('');
              setError('');
            }}
            disabled={loading}
          >
            Auto Generate
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'manual' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setMode('manual');
              setError('');
            }}
            disabled={loading}
          >
            Manual Password
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Driver Email Address
            </label>
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
              <label htmlFor="manualPassword" className={styles.label}>
                Temporary Password
              </label>
              <input
                id="manualPassword"
                type="password"
                value={manualPassword}
                onChange={(e) => setManualPassword(e.target.value)}
                placeholder="Enter a password (min 6 chars)"
                required={mode === 'manual'}
                disabled={loading}
                className={styles.input}
              />
              <small className={styles.hint}>
                Minimum 6 characters. This will be sent to the driver.
              </small>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="expiresInHours" className={styles.label}>
              Expiration (hours)
            </label>
            <select
              id="expiresInHours"
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(e.target.value)}
              disabled={loading}
              className={styles.input}
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </select>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? 'Generating...' : 'Generate Code'}
          </button>
        </form>

        {success && result && (
          <div className={styles.successBox}>
            <h2 className={styles.successTitle}>✓ Code Generated Successfully</h2>
            <div className={styles.resultField}>
              <label>Email</label>
              <div className={styles.resultValue}>{result.email}</div>
            </div>

            {result.temporaryPassword && (
              <div className={styles.resultField}>
                <label>Temporary Password (Development Only)</label>
                <div className={styles.resultValue}>{result.temporaryPassword}</div>
                <small className={styles.hint}>
                  In production, this is only sent via email
                </small>
              </div>
            )}

            <div className={styles.resultField}>
              <label>Expires At</label>
              <div className={styles.resultValue}>{new Date(result.expiresAt).toLocaleString()}</div>
            </div>

            <div className={styles.instructions}>
              <h3>Next Steps:</h3>
              <ol>
                <li>Send the temporary password to the driver via email</li>
                <li>
                  Driver goes to{' '}
                  <code className={styles.code}>/vetting/login</code>
                </li>
                <li>Driver clicks "Got a temporary password?"</li>
                <li>Driver enters email, temporary password, and creates a new password</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
