'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import styles from './page.module.css';

export default function SetupPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function validateCode() {
      if (!code) {
        setError('Invalid or missing invitation code');
        setIsLoading(false);
        return;
      }

      try {
        const inviteDoc = await getDoc(doc(db, 'invitationLinks', code));

        if (!inviteDoc.exists()) {
          setError('Invitation link not found');
          setIsLoading(false);
          return;
        }

        const data = inviteDoc.data();
        if (data.used) {
          setError('This invitation link has already been used');
          setIsLoading(false);
          return;
        }

        setEmail(data.email);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to validate invitation');
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

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (name) {
        await updateProfile(user, { displayName: name });
      }

      if (code) {
        await updateDoc(doc(db, 'invitationLinks', code), {
          used: true,
          usedAt: Timestamp.now(),
          uid: user.uid,
        });
      }

      const driverRef = doc(db, 'drivers', user.uid);
      await updateDoc(driverRef, {
        email: email.toLowerCase(),
        uid: user.uid,
        lastSignIn: Timestamp.now(),
      }).catch(async () => {
        await updateDoc(driverRef, {
          email: email.toLowerCase(),
          uid: user.uid,
          createdAt: Timestamp.now(),
        });
      });

      router.push('/vetting/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading && !email) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid Invitation</h1>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => router.push('/vetting/login')}
            className={styles.backButton}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Set Up Your Password</h1>
        <p className={styles.subtitle}>Create a password for your driver account</p>

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
            <label htmlFor="name">Full Name (Optional)</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
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
              placeholder="Confirm your password"
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
            {isSubmitting ? 'Setting up...' : 'Set Password & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
