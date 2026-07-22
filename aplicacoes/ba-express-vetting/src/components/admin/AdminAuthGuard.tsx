'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/vetting');
      return;
    }
    if (!user?.isAdmin) {
      router.replace('/vetting/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div
        aria-hidden="true"
        style={{
          minHeight: '100vh',
          background: '#0f172a',
        }}
      />
    );
  }

  return children;
}
