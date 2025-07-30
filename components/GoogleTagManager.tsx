'use client';

import { useEffect, useRef } from 'react';

// TypeScript declarations for Google Tag Manager
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Google Tag Manager component for Next.js
export default function GoogleTagManager() {
  const gtmId = 'GTM-TZT6ZFSS';
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const noscriptRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Only run on client side after component mounts
    if (typeof window === 'undefined') return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Create and inject the GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    script.id = 'gtm-script';
    
    // Insert the script into the head
    const head = document.getElementsByTagName('head')[0];
    if (head) {
      head.appendChild(script);
    }

    // Create noscript iframe
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    
    noscript.appendChild(iframe);
    document.body.appendChild(noscript);

    // Store references for cleanup
    scriptRef.current = script;

    // Cleanup function
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      if (noscript && noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, []);

  // Return null to prevent any server-side rendering
  return null;
} 