import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const next = searchParams.get('next') || '/dashboard';

    // Enhanced logging for production debugging
    console.log('OAuth callback received:', {
      url: request.url,
      code: code ? 'present' : 'missing',
      error: error || 'none',
      errorDescription: errorDescription || 'none',
      next
    });

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      const errorUrl = new URL('/sign-in', request.url);
      errorUrl.searchParams.set('error', 'oauth_error');
      errorUrl.searchParams.set('description', errorDescription || error);
      return NextResponse.redirect(errorUrl);
    }

    // Handle missing OAuth code (direct access to callback)
    if (!code) {
      console.error('No OAuth code received - redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('OAuth callback exchange error:', exchangeError);
      const errorUrl = new URL('/sign-in', request.url);
      errorUrl.searchParams.set('error', 'exchange_error');
      errorUrl.searchParams.set('description', exchangeError.message);
      return NextResponse.redirect(errorUrl);
    }

    if (!data.user) {
      console.error('No user data after OAuth exchange');
      const errorUrl = new URL('/sign-in', request.url);
      errorUrl.searchParams.set('error', 'no_user');
      return NextResponse.redirect(errorUrl);
    }

    console.log('OAuth user authenticated:', data.user.id);

    // OAuth authentication is complete - auth.users is automatically created by Supabase
    // No need to manually create profiles or use any other tables for authentication

    // Check if user has an air club
    const { data: airClub } = await supabase
      .from('air_club')
      .select('*')
      .eq('created_by', data.user.id)
      .single();

    if (!airClub) {
      console.log('No air club found for user, redirecting to setup');
      // Use localhost for local development, production URL for production
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://slotroster.com');
      return NextResponse.redirect(new URL('/setup', baseUrl));
    }

    console.log('OAuth flow completed successfully, redirecting to:', next);
    // Use localhost for local development, production URL for production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseUrl = isDevelopment ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://slotroster.com');
    return NextResponse.redirect(new URL(next, baseUrl));
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error);
    // Return a proper error response instead of redirecting
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 