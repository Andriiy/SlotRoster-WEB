import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/payments/stripe';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const supabase = await createClient();

  if (session.payment_status === 'paid') {
    // Get the user from the client reference ID
    const userId = session.client_reference_id as string;
    
    // Get user's air club
    const { data: profile } = await supabase
      .from('profiles')
      .select('air_club_id')
      .eq('user_id', userId)
      .single();

    if (profile?.air_club_id) {
      // Update air club with Stripe customer ID
      await supabase
        .from('air_club')
        .update({
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.air_club_id);
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
