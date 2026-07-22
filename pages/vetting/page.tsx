'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VettingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/vetting/login');
  }, [router]);

  return null;
}
