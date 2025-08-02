import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user's air club
    const { searchParams } = new URL(request.url);
    const airClubId = searchParams.get('airClubId');

    if (!airClubId) {
      return NextResponse.json(
        { success: false, error: 'Air club ID is required' },
        { status: 400 }
      );
    }

    // Get air club's subscription
    const { data: airClub, error: airClubError } = await supabase
      .from('air_club')
      .select('stripe_subscription_id')
      .eq('id', airClubId)
      .single();

    if (airClubError || !airClub?.stripe_subscription_id) {
      return NextResponse.json({
        success: true,
        subscription: null
      });
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(airClub.stripe_subscription_id);

    return NextResponse.json({
      success: true,
      subscription: subscription
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 