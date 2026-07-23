'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DriverLogin } from '@/components/vetting/DriverLogin';

export default function VettingLoginPage() {
  const { isAuthenticated, recordLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !recordLoading) {
      router.replace('/vetting/dashboard');
    }
  }, [isAuthenticated, recordLoading, router]);

  if (isAuthenticated && !recordLoading) {
    return null;
  }

  return <DriverLogin />;
}
