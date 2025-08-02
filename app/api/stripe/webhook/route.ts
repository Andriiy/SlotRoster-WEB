import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    console.log('Webhook received:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
    });

    if (!signature) {
      console.error('No signature provided');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log('Webhook event constructed successfully:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', {
          sessionId: session.id,
          mode: session.mode,
          hasSubscription: !!session.subscription,
          metadata: session.metadata
        });
        
        if (session.mode === 'subscription' && session.subscription) {
          console.log('Processing completed checkout session:', session.id);
          
          try {
            // Get subscription details from Stripe
            // Retrieve subscription and customer details from Stripe
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const customer = session.customer ? await stripe.customers.retrieve(session.customer as string) : null;
            
            console.log('Retrieved subscription from Stripe:', {
              subscriptionId: subscription.id,
              status: subscription.status,
              customerId: customer?.id,
              currentPeriodStart: (subscription as any).current_period_start,
              currentPeriodEnd: (subscription as any).current_period_end
            });
            
            // Extract metadata from the checkout session
            const airClubId = session.metadata?.airClubId;
            const userId = session.metadata?.userId;
            const aircraftCount = parseInt(session.metadata?.aircraftCount || '1');
            const productType = session.metadata?.productType || 'monthly';
            
            console.log('Subscription metadata:', {
              airClubId,
              userId,
              aircraftCount,
              productType
            });

            // Update air club with subscription details if airClubId is available
            if (airClubId) {
              console.log('Updating air club with subscription data...');
              
              // Safely handle subscription period dates with proper null checks
              const currentPeriodStart = (subscription as any).current_period_start;
              const currentPeriodEnd = (subscription as any).current_period_end;
              
              console.log('Processing subscription dates:', {
                currentPeriodStart,
                currentPeriodEnd,
                currentPeriodStartType: typeof currentPeriodStart,
                currentPeriodEndType: typeof currentPeriodEnd
              });
              
              const subscriptionStartDate = currentPeriodStart && !isNaN(currentPeriodStart) ? 
                new Date(currentPeriodStart * 1000).toISOString() : 
                new Date().toISOString();
                
              const subscriptionEndDate = currentPeriodEnd && !isNaN(currentPeriodEnd) ? 
                new Date(currentPeriodEnd * 1000).toISOString() : 
                new Date().toISOString();
              
              const { error: updateError } = await supabase
                .from('air_club')
                .update({
                  stripe_subscription_id: subscription.id,
                  stripe_customer_id: customer?.id || null,
                  plan_name: `${aircraftCount} Aircraft - ${productType === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
                  subscription_status: subscription.status,
                  aircraft_limit: aircraftCount,
                  subscription_start_date: subscriptionStartDate,
                  subscription_end_date: subscriptionEndDate,
                  updated_at: new Date().toISOString()
                })
                .eq('id', airClubId);

              if (updateError) {
                console.error('Error updating air club:', updateError);
              } else {
                console.log('Successfully updated air club with subscription data');
              }
            } else {
              console.warn('No airClubId found in session metadata');
            }

            // Create subscription record in database
            console.log('Creating subscription record in database...');
            
            // Only create subscription record if we have valid airClubId and userId
            if (airClubId && userId) {
              // Safely handle subscription period dates with proper null checks
              const currentPeriodStart = (subscription as any).current_period_start;
              const currentPeriodEnd = (subscription as any).current_period_end;
              
              console.log('Processing subscription record dates:', {
                currentPeriodStart,
                currentPeriodEnd,
                currentPeriodStartType: typeof currentPeriodStart,
                currentPeriodEndType: typeof currentPeriodEnd
              });
              
              const subscriptionPeriodStart = currentPeriodStart && !isNaN(currentPeriodStart) ? 
                new Date(currentPeriodStart * 1000).toISOString() : 
                new Date().toISOString();
                
              const subscriptionPeriodEnd = currentPeriodEnd && !isNaN(currentPeriodEnd) ? 
                new Date(currentPeriodEnd * 1000).toISOString() : 
                new Date().toISOString();
              
              const subscriptionData = {
                stripe_subscription_id: subscription.id,
                stripe_customer_id: customer?.id || null,
                air_club_id: airClubId,
                user_id: userId,
                status: subscription.status,
                plan_type: productType,
                aircraft_count: aircraftCount,
                amount: subscription.items.data[0]?.price.unit_amount || 0,
                currency: subscription.currency,
                current_period_start: subscriptionPeriodStart,
                current_period_end: subscriptionPeriodEnd,
                created_at: new Date().toISOString()
              };

              console.log('Subscription data to insert:', subscriptionData);

              const { data: insertedData, error: subscriptionError } = await supabase
                .from('subscriptions')
                .insert(subscriptionData)
                .select();

              if (subscriptionError) {
                console.error('Error creating subscription record:', subscriptionError);
                console.error('Error details:', {
                  code: subscriptionError.code,
                  message: subscriptionError.message,
                  details: subscriptionError.details,
                  hint: subscriptionError.hint
                });
              } else {
                console.log('Successfully created subscription record in database:', insertedData);
              }
            } else {
              console.warn('Skipping subscription record creation - missing airClubId or userId:', {
                airClubId,
                userId
              });
            }
          } catch (error) {
            console.error('Error processing checkout session:', error);
          }
        } else {
          console.log('Session is not a subscription or missing subscription ID');
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        
        // Update air club subscription status
        const { error: updateError } = await supabase
          .from('air_club')
          .update({
            subscription_status: updatedSubscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', updatedSubscription.id);

        if (updateError) {
          console.error('Error updating air club subscription:', updateError);
        }

        // Update subscription record
        // Safely handle subscription period dates with proper null checks
        const updatedCurrentPeriodStart = (updatedSubscription as any).current_period_start;
        const updatedCurrentPeriodEnd = (updatedSubscription as any).current_period_end;
        
        console.log('Processing updated subscription dates:', {
          updatedCurrentPeriodStart,
          updatedCurrentPeriodEnd,
          updatedCurrentPeriodStartType: typeof updatedCurrentPeriodStart,
          updatedCurrentPeriodEndType: typeof updatedCurrentPeriodEnd
        });
        
        const updatedSubscriptionPeriodStart = updatedCurrentPeriodStart && !isNaN(updatedCurrentPeriodStart) ? 
          new Date(updatedCurrentPeriodStart * 1000).toISOString() : 
          new Date().toISOString();
          
        const updatedSubscriptionPeriodEnd = updatedCurrentPeriodEnd && !isNaN(updatedCurrentPeriodEnd) ? 
          new Date(updatedCurrentPeriodEnd * 1000).toISOString() : 
          new Date().toISOString();
        
        const { error: subscriptionUpdateError } = await supabase
          .from('subscriptions')
          .update({
            status: updatedSubscription.status,
            current_period_start: updatedSubscriptionPeriodStart,
            current_period_end: updatedSubscriptionPeriodEnd,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', updatedSubscription.id);

        if (subscriptionUpdateError) {
          console.error('Error updating subscription record:', subscriptionUpdateError);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription deleted:', deletedSubscription.id);
        
        // Update air club when subscription is canceled
        const { error: cancelError } = await supabase
          .from('air_club')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', deletedSubscription.id);

        if (cancelError) {
          console.error('Error updating air club on cancellation:', cancelError);
        }

        // Update subscription record
        const { error: subscriptionCancelError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', deletedSubscription.id);

        if (subscriptionCancelError) {
          console.error('Error updating subscription record on cancellation:', subscriptionCancelError);
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        const invoiceSubscriptionId = (invoice as any).subscription;
        console.log('Payment succeeded for subscription:', invoiceSubscriptionId);
        
        if (invoiceSubscriptionId) {
          // Update air club subscription status
          const { error: invoiceError } = await supabase
            .from('air_club')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoiceSubscriptionId);

          if (invoiceError) {
            console.error('Error updating air club on payment:', invoiceError);
          }

          // Update subscription record
          const { error: subscriptionPaymentError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoiceSubscriptionId);

          if (subscriptionPaymentError) {
            console.error('Error updating subscription record on payment:', subscriptionPaymentError);
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        const failedInvoiceSubscriptionId = (failedInvoice as any).subscription;
        console.log('Payment failed for subscription:', failedInvoiceSubscriptionId);
        
        if (failedInvoiceSubscriptionId) {
          // Update air club subscription status
          const { error: failedError } = await supabase
            .from('air_club')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', failedInvoiceSubscriptionId);

          if (failedError) {
            console.error('Error updating air club on failed payment:', failedError);
          }

          // Update subscription record
          const { error: subscriptionFailedError } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', failedInvoiceSubscriptionId);

          if (subscriptionFailedError) {
            console.error('Error updating subscription record on failed payment:', subscriptionFailedError);
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
