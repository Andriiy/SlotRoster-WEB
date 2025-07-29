import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('OAuth callback received:', { code: !!code, error, next });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/sign-in?error=${error}&description=${errorDescription}`, request.url));
  }

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log('OAuth exchange result:', { 
      hasUser: !!data?.user, 
      hasSession: !!data?.session, 
      error: exchangeError?.message 
    });
    
    if (exchangeError) {
      console.error('OAuth callback error:', exchangeError);
      return NextResponse.redirect(new URL('/sign-in?error=oauth_error', request.url));
    }

    if (data.user) {
      console.log('User authenticated:', data.user.email);
      
      // Check if user has a profile, if not create one
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (!profile) {
        console.log('Creating profile for OAuth user:', data.user.email);
        // For OAuth users, we need to handle the air_club_id requirement
        // Let's create a default air club for OAuth users or handle this differently
        try {
          // First, try to create profile without air_club_id (if it's nullable)
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
              is_admin: false,
              is_pilot: false,
              is_instructor: false,
            });

          if (profileError) {
            console.error('Error creating profile for OAuth user:', profileError);
            // If air_club_id is required, redirect to a setup page
            if (profileError.code === '23502' && profileError.message.includes('air_club_id')) {
              console.error('air_club_id is required - redirecting to setup');
              return NextResponse.redirect(new URL('/dashboard?setup=required', request.url));
            }
          } else {
            console.log('Profile created successfully for OAuth user');
          }
        } catch (error) {
          console.error('Unexpected error creating profile:', error);
        }
      } else {
        console.log('Profile already exists for user');
      }
    }

    console.log('Redirecting to:', next);
    // Redirect to the intended destination
    return NextResponse.redirect(new URL(next, request.url));
  }

  console.log('No code provided, redirecting to sign-in');
  // If no code, redirect to sign-in
  return NextResponse.redirect(new URL('/sign-in', request.url));
} 