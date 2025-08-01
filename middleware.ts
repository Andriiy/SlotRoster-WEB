import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for auth callback and API routes
    if (pathname.startsWith('/auth/callback') || pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Create a response object that we can modify
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Only check authentication for protected routes
    if (isProtectedRoute) {
      // For now, just redirect to sign-in for protected routes
      // We'll add proper auth later
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a simple response on error
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
