import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { airClubId } = await request.json();

    // Validate required fields
    if (!airClubId) {
      return NextResponse.json(
        { success: false, error: 'Air club ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get air club's current subscription
    const { data: airClub, error: airClubError } = await supabase
      .from('air_club')
      .select('stripe_subscription_id')
      .eq('id', airClubId)
      .single();

    if (airClubError || !airClub?.stripe_subscription_id) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription in Stripe
    const subscription = await stripe.subscriptions.update(airClub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update air club record
    const { error: updateError } = await supabase
      .from('air_club')
      .update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', airClubId);

    if (updateError) {
      console.error('Error updating air club:', updateError);
    }

    return NextResponse.json({
      success: true,
      subscription: subscription
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 