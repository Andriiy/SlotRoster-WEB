import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSessionURL } from '@/lib/payments/stripe';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const { priceId, airClubId, planName, aircraftLimit } = await request.json();

    if (!priceId || !airClubId || !planName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the air club
    const supabase = await createClient();
    const { data: airClub, error: airClubError } = await supabase
      .from('air_club')
      .select('*')
      .eq('id', airClubId)
      .single();

    if (airClubError || !airClub) {
      console.error('Air club not found:', airClubError);
      return NextResponse.json(
        { error: 'Air club not found' },
        { status: 404 }
      );
    }

    // Create checkout session with metadata
    const session = await createCheckoutSessionURL({
      airClub,
      priceId,
      metadata: {
        airClubId,
        planName,
        aircraftLimit: aircraftLimit?.toString() || '1'
      }
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard/products', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items.data.price.product']
    }) as any;

    const supabase = await createClient();

    if (session.payment_status === 'paid') {
      // Get air club ID from session metadata
      const airClubId = session.metadata?.airClubId;
      const planName = session.metadata?.planName;
      
      if (airClubId && session.subscription) {
        // Get subscription and product information
        let subscriptionId: string;
        let subscriptionStatus: string = 'active';
        
        if (typeof session.subscription === 'string') {
          subscriptionId = session.subscription;
        } else {
          subscriptionId = (session.subscription as any).id;
          subscriptionStatus = (session.subscription as any).status;
        }
        
        const lineItem = session.line_items?.data[0];
        const product = lineItem?.price?.product as any;

        // Update air club with all Stripe information
        const { error } = await supabase
          .from('air_club')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            stripe_product_id: product?.id,
            subscription_status: subscriptionStatus,
            plan_name: planName || 'Unknown'
          })
          .eq('id', airClubId);

        if (error) {
          console.error('Error updating air club:', error);
        }
      } else {
        console.error('No airClubId found in session metadata or no subscription');
      }
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error processing checkout success:', error);
    return NextResponse.redirect(new URL('/dashboard/products', request.url));
  }
}
