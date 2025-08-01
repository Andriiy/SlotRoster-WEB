import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const next = searchParams.get('next') || '/dashboard';

  if (error) {
    console.error('OAuth error:', error, searchParams.get('error_description'));
    return NextResponse.redirect(new URL('/sign-in?error=oauth_error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('OAuth callback error:', exchangeError);
      return NextResponse.redirect(new URL('/sign-in?error=exchange_error', request.url));
    }

    if (!data.user) {
      return NextResponse.redirect(new URL('/sign-in?error=no_user', request.url));
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error creating profile for OAuth user:', profileError);
      return NextResponse.redirect(new URL('/sign-in?error=profile_error', request.url));
    }

    if (!profile) {
      // Create profile for OAuth user
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          avatar_url: data.user.user_metadata?.avatar_url
        });

      if (insertError) {
        console.error('Error creating profile for OAuth user:', insertError);
        return NextResponse.redirect(new URL('/sign-in?error=profile_creation_error', request.url));
      }
    }

    // Check if user has an air club
    const { data: airClub } = await supabase
      .from('air_club')
      .select('*')
      .eq('created_by', data.user.id)
      .single();

    if (!airClub) {
      console.error('air_club_id is required - redirecting to setup');
      return NextResponse.redirect(new URL('/setup', request.url));
    }

    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error('Unexpected error creating profile:', error);
    return NextResponse.redirect(new URL('/sign-in?error=unexpected_error', request.url));
  }
} 