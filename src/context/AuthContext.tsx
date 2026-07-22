'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ isAdmin: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  completeFirstAccess: (
    email: string,
    temporaryPassword: string,
    newPassword: string,
  ) => Promise<{ isAdmin: boolean }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasCandidateRecord: boolean | null;
  recordLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(fb: FirebaseUser): User {
  return {
    id: fb.uid,
    email: fb.email ?? '',
    displayName: fb.displayName ?? fb.email ?? 'User',
    photoURL: fb.photoURL,
    isAdmin: fb.email?.endsWith('@baexpress.co.uk') ?? false,
  };
}

function normaliseFirstAccessEmailKey(email: string) {
  return email.trim().toLowerCase().replace(/[^a-z0-9._%+-@]/g, '_');
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCandidateRecord, setHasCandidateRecord] = useState<boolean | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fb) => {
      setUser(fb ? toUser(fb) : null);
      setHasCandidateRecord(null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || user.isAdmin || !user.email) {
      setRecordLoading(false);
      setHasCandidateRecord(user?.isAdmin ? true : null);
      return;
    }

    let active = true;
    setRecordLoading(true);
    Promise.all([
      getDocs(query(collection(db, 'drivers'), where('email', '==', user.email), limit(1))),
      getDocs(
        query(
          collection(db, 'workspaces', 'ba-express-vetting', 'vendors'),
          where('email', '==', user.email),
          limit(1),
        ),
      ),
    ])
      .then(([drivers, vendors]) => {
        if (active) setHasCandidateRecord(!drivers.empty || !vendors.empty);
      })
      .catch(() => {
        if (active) setHasCandidateRecord(null);
      })
      .finally(() => {
        if (active) setRecordLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = toUser(result.user);
    return { isAdmin: u.isAdmin };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const u = toUser(result.user);
    return { isAdmin: u.isAdmin };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const u = toUser(result.user);
    return { isAdmin: u.isAdmin };
  };

  const completeFirstAccess = async (
    email: string,
    temporaryPassword: string,
    newPassword: string,
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const accessRef = doc(db, 'firstAccessCodes', normaliseFirstAccessEmailKey(cleanEmail));
    const accessSnap = await getDoc(accessRef);

    if (!accessSnap.exists()) {
      throw Object.assign(new Error('First access was not found for this email.'), {
        code: 'first-access/not-found',
      });
    }

    const data = accessSnap.data();
    if (data.consumedAt) {
      throw Object.assign(new Error('This first access password has already been used.'), {
        code: 'first-access/used',
      });
    }
    if (typeof data.expiresAt === 'number' && data.expiresAt < Date.now()) {
      throw Object.assign(new Error('This first access password has expired.'), {
        code: 'first-access/expired',
      });
    }
    if (typeof data.salt !== 'string' || typeof data.codeHash !== 'string') {
      throw Object.assign(new Error('First access is not configured correctly.'), {
        code: 'first-access/misconfigured',
      });
    }

    const candidateHash = await sha256(`${data.salt}:${temporaryPassword.trim()}`);
    if (candidateHash !== data.codeHash) {
      throw Object.assign(new Error('Temporary password is incorrect.'), {
        code: 'first-access/invalid-code',
      });
    }

    const result = await createUserWithEmailAndPassword(auth, cleanEmail, newPassword);
    await updateDoc(accessRef, {
      consumedAt: serverTimestamp(),
      uid: result.user.uid,
    });

    const u = toUser(result.user);
    return { isAdmin: u.isAdmin };
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        completeFirstAccess,
        signOut,
        isAuthenticated: !!user,
        hasCandidateRecord,
        recordLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
