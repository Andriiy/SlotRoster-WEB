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

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile for OAuth user:', profileError);
      const errorUrl = new URL('/sign-in', request.url);
      errorUrl.searchParams.set('error', 'profile_error');
      errorUrl.searchParams.set('description', profileError.message);
      return NextResponse.redirect(errorUrl);
    }

    if (!profile) {
      console.log('Creating profile for OAuth user:', data.user.id);
      // Create profile for OAuth user - only insert existing columns
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          is_admin: false,
          is_pilot: false,
          is_instructor: false
        });

      if (insertError) {
        console.error('Error creating profile for OAuth user:', insertError);
        const errorUrl = new URL('/sign-in', request.url);
        errorUrl.searchParams.set('error', 'profile_creation_error');
        errorUrl.searchParams.set('description', insertError.message);
        return NextResponse.redirect(errorUrl);
      }
    }

    // Check if user has an air club
    const { data: airClub } = await supabase
      .from('air_club')
      .select('*')
      .eq('created_by', data.user.id)
      .single();

    if (!airClub) {
      console.log('No air club found for user, redirecting to setup');
      return NextResponse.redirect(new URL('/setup', request.url));
    }

    console.log('OAuth flow completed successfully, redirecting to:', next);
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error);
    // Return a proper error response instead of redirecting
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 