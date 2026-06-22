'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Instantly push the landing user to the login flow
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-400">
      <p className="animate-pulse">Redirecting to secure terminal...</p>
    </div>
  );
}