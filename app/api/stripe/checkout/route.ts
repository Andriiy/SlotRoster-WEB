import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { priceId, quantity = 1, airClubId, successUrl, cancelUrl } = await request.json();

    // Validate required fields
    if (!priceId) {
      return NextResponse.json(
        { success: false, error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Validate quantity
    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 10) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 10' },
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

    console.log('Checkout request data:', {
      priceId,
      quantity: qty,
      airClubId,
      userId: user.id,
      userEmail: user.email
    });

    // Get price details to validate aircraft count
    const price = await stripe.prices.retrieve(priceId);
    const aircraftCount = parseInt(price.metadata?.aircraft_count || '1');
    const productType = price.metadata?.type || 'monthly';

    console.log('Price details:', {
      priceId,
      aircraftCount,
      productType,
      priceMetadata: price.metadata
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1, // Always 1 since price includes aircraft count
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/stripe?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        airClubId: airClubId || '',
        priceId: priceId,
        aircraftCount: aircraftCount.toString(),
        productType: productType,
        unitPrice: price.metadata?.unit_price || '0',
        totalPrice: price.metadata?.total_price || '0',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          airClubId: airClubId || '',
          priceId: priceId,
          aircraftCount: aircraftCount.toString(),
          productType: productType,
          unitPrice: price.metadata?.unit_price || '0',
          totalPrice: price.metadata?.total_price || '0',
        },
      },
    });

    console.log('Created checkout session:', {
      sessionId: session.id,
      sessionMetadata: session.metadata,
      subscriptionDataMetadata: (session as any).subscription_data?.metadata
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
