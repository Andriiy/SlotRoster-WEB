'use client';

import Link from 'next/link';
import { use, useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth/middleware';
import useSWR, { mutate } from 'swr';

// Utility function to clear all SWR caches
function clearAllCaches() {
  // Clear specific caches with immediate effect
  mutate('/api/user', null, false);
          mutate('/api/flying-community', null, false);
  
  // Force revalidation to ensure fresh data
  mutate('/api/user', undefined, { revalidate: true });
          mutate('/api/flying-community', undefined, { revalidate: true });
  
  // Clear all caches (more comprehensive)
  mutate(() => true, undefined, { revalidate: false });
  
  // Force a complete cache reset
  mutate('/api/user', undefined, { revalidate: false });
          mutate('/api/flying-community', undefined, { revalidate: false });
}

// Brute force function to clear everything
function bruteForceRefresh() {
  
  
  // Clear all SWR caches
  clearAllCaches();
  
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear all cookies (except essential ones)
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  // Force a complete page reload with cache bypass
  window.location.href = window.location.origin + '?refresh=' + Date.now();
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Start as true, will be updated by SWR
  const [userData, setUserData] = useState<User | null>(null);
  
  const { data: user, error, isLoading } = useSWR<User>(
    isAuthenticated ? `/api/user?v=${forceRefresh}` : null, 
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // Disable deduplication
      errorRetryCount: 0, // Don't retry on error
      onSuccess: (data) => {
        setIsAuthenticated(true);
        setUserData(data);
      },
      onError: () => {
        setIsAuthenticated(false);
        setUserData(null);
      }
    }
  );
  const router = useRouter();

  // Effect to handle authentication state changes
  useEffect(() => {
    if (error) {
      setIsAuthenticated(false);
      setUserData(null);
    }
  }, [error]);

  // Effect to sync user data
  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  async function handleSignOut() {
    setIsSigningOut(true);
    
    try {
      // Clear all caches first
      clearAllCaches();
      
      // Call the sign out action
    await signOut();
      
      // Force a complete refresh
      bruteForceRefresh();
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, force refresh to ensure clean state
      bruteForceRefresh();
    }
  }

  // Show sign-in/sign-up buttons if not authenticated or error
  if (!isAuthenticated || !userData || error) {

    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Pricing
        </Link>
        <Button asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  // Ensure we have valid user data
  if (!userData.id || !userData.email) {

    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Pricing
        </Link>
        <Button asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }


  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={userData.name || userData.email || ''} />
          <AvatarFallback>
            {userData.name
              ? userData.name.split(' ').map((n) => n[0]).join('').toUpperCase()
              : userData.email
              ? userData.email.split('@')[0].charAt(0).toUpperCase()
              : 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full" disabled={isSigningOut}>
            <DropdownMenuItem className="w-full flex-1 cursor-pointer" disabled={isSigningOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-semibold text-foreground">Flight Club</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
      </main>
    </div>
  );
}
