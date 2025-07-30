'use client';

import dynamic from 'next/dynamic';

// Dynamically import GTM with no SSR to prevent hydration errors
const GoogleTagManager = dynamic(() => import('@/components/GoogleTagManager'), {
  ssr: false,
  loading: () => null
});

export default function GTMWrapper() {
  return <GoogleTagManager />;
} 