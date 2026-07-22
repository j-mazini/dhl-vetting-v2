'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VettingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vetting/login');
  }, [router]);

  return null;
}
