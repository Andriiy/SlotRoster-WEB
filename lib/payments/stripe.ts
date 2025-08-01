import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

export async function createCheckoutSession({
  airClub,
  priceId
}: {
  airClub: any | null;
  priceId: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!airClub || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // Use fallback BASE_URL if not set
  const baseUrl = process.env.BASE_URL || 'http://localhost:3002';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${baseUrl}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/products`,
    customer: airClub.stripe_customer_id || undefined,
    client_reference_id: user.id,
    allow_promotion_codes: true
  });

  redirect(session.url!);
}

export async function createCheckoutSessionURL({
  airClub,
  priceId,
  metadata
}: {
  airClub: any | null;
  priceId: string;
  metadata?: Record<string, string>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!airClub || !user) {
    throw new Error('User or air club not found');
  }

  // Use fallback BASE_URL if not set
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${baseUrl}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/products`,
    customer: airClub.stripe_customer_id || undefined,
    client_reference_id: user.id,
    allow_promotion_codes: true,
    metadata: metadata || {}
  });

  return session;
}

export async function createCustomerPortalSession(airClub: any) {
  if (!airClub.stripe_customer_id || !airClub.stripe_product_id) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(airClub.stripe_product_id);
    if (!product.active) {
      throw new Error("Air club's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the air club's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: airClub.stripe_customer_id,
    return_url: `${process.env.BASE_URL || 'http://localhost:3002'}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const supabase = await createClient();
  
  // Get air club by Stripe customer ID
  const { data: airClub } = await supabase
    .from('air_club')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!airClub) {
    console.error('Air club not found for Stripe customer:', customerId);
    return;
  }

  // Update air club subscription status
  await supabase
    .from('air_club')
    .update({
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', airClub.id);

  console.log(`Updated air club ${airClub.id} subscription status to ${status}`);
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product']
  });

  return prices.data;
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true
  });

  return products.data;
}

// Trial management functions
export async function startFreeTrial(airClubId: string, planName: string, aircraftLimit: number = 999) {
  const supabase = await createClient();
  
  const trialStartDate = new Date();
  const trialEndDate = new Date();
  trialEndDate.setMonth(trialEndDate.getMonth() + 1); // 1 month trial
  
  const { data, error } = await supabase
    .from('air_club')
    .update({
      trial_start_date: trialStartDate.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
      is_trial_active: true,
      trial_plan_name: planName,
      trial_aircraft_limit: aircraftLimit, // Allow unlimited aircraft during trial
      subscription_status: 'trialing'
    })
    .eq('id', airClubId)
    .select()
    .single();
    
  if (error) {
    console.error('Error starting free trial:', error);
    throw error;
  }
  
  return data;
}

export async function checkTrialStatus(airClubId: string) {
  const supabase = await createClient();
  
  const { data: airClub, error } = await supabase
    .from('air_club')
    .select('*')
    .eq('id', airClubId)
    .single();
    
  if (error || !airClub) {
    throw new Error('Air club not found');
  }
  
  // Check if trial has expired
  if (airClub.is_trial_active && airClub.trial_end_date) {
    const trialEndDate = new Date(airClub.trial_end_date);
    const now = new Date();
    
    if (now > trialEndDate) {
      // Trial has expired, update status
      await supabase
        .from('air_club')
        .update({
          is_trial_active: false,
          subscription_status: 'inactive'
        })
        .eq('id', airClubId);
        
      return {
        ...airClub,
        is_trial_active: false,
        subscription_status: 'inactive'
      };
    }
  }
  
  return airClub;
}

export async function getTrialDaysRemaining(airClubId: string) {
  const airClub = await checkTrialStatus(airClubId);
  
  if (!airClub.is_trial_active || !airClub.trial_end_date) {
    return 0;
  }
  
  const trialEndDate = new Date(airClub.trial_end_date);
  const now = new Date();
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

export async function canAddAircraft(airClubId: string) {
  const supabase = await createClient();
  const airClub = await checkTrialStatus(airClubId);
  
  // If on trial, allow unlimited aircraft
  if (airClub.is_trial_active) {
    return true; // Unlimited aircraft during trial
  }
  
  // If paid subscription, check based on plan
  const aircraftLimit = getAircraftLimitForPlan(airClub.plan_name);
  const { data: aircraftCount } = await supabase
    .from('aircrafts')
    .select('id', { count: 'exact' })
    .eq('air_club_id', airClubId);
    
  return (aircraftCount?.length || 0) < aircraftLimit;
}

function getAircraftLimitForPlan(planName: string | null): number {
  switch (planName) {
    case 'Single Aircraft':
      return 1;
    case 'Small Fleet':
      return 3;
    case 'Medium Fleet':
      return 5;
    case 'Large Fleet':
      return 7;
    case 'Unlimited':
      return 999; // Unlimited
    default:
      return 1;
  }
}
