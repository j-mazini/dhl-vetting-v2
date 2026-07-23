'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VettingPage() {
  const { isAuthenticated, recordLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (recordLoading) return;

    if (isAuthenticated) {
      router.replace('/vetting/dashboard');
    } else {
      router.replace('/vetting/login');
    }
  }, [isAuthenticated, recordLoading, router]);

  return null;
}
