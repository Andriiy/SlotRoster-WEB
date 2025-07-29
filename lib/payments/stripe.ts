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

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: airClub.stripe_customer_id || undefined,
    client_reference_id: user.id,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14
    }
  });

  redirect(session.url!);
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
    return_url: `${process.env.BASE_URL}/dashboard`,
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
