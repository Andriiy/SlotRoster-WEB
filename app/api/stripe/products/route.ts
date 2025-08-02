import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    // Create or retrieve monthly product
    let monthlyProduct: Stripe.Product;
    try {
      monthlyProduct = await stripe.products.retrieve('prod_monthly_aircraft');
    } catch {
      // Create monthly product if it doesn't exist
      monthlyProduct = await stripe.products.create({
        id: 'prod_monthly_aircraft',
        name: 'Monthly Aircraft Subscription',
        description: 'Pay per aircraft monthly subscription',
        metadata: {
          type: 'monthly',
          aircraft_based: 'true'
        }
      });
    }

    // Create or retrieve yearly product
    let yearlyProduct: Stripe.Product;
    try {
      yearlyProduct = await stripe.products.retrieve('prod_yearly_aircraft');
    } catch {
      // Create yearly product if it doesn't exist
      yearlyProduct = await stripe.products.create({
        id: 'prod_yearly_aircraft',
        name: 'Yearly Aircraft Subscription',
        description: 'Pay per aircraft yearly subscription (save 17%)',
        metadata: {
          type: 'yearly',
          aircraft_based: 'true'
        }
      });
    }

    // Get existing prices for both products
    const [monthlyPrices, yearlyPrices] = await Promise.all([
      stripe.prices.list({ product: monthlyProduct.id, active: true }),
      stripe.prices.list({ product: yearlyProduct.id, active: true })
    ]);

    // Create prices for different aircraft quantities (1-10) only if they don't exist
    const productsWithPrices = await Promise.all([
      monthlyProduct,
      yearlyProduct
    ].map(async (product) => {
      const existingPrices = product.id === monthlyProduct.id ? monthlyPrices.data : yearlyPrices.data;
      const prices = [...existingPrices]; // Start with existing prices
      
      // Create prices for 1-10 aircraft only if they don't exist
      for (let aircraft = 1; aircraft <= 10; aircraft++) {
        const unitAmount = product.metadata.type === 'monthly' ? 500 : 5000; // 5€ monthly, 50€ yearly
        const totalAmount = unitAmount * aircraft;
        
        // Check if price already exists for this aircraft count
        const existingPrice = existingPrices.find(price => 
          price.metadata?.aircraft_count === aircraft.toString() &&
          price.metadata?.type === product.metadata.type
        );
        
        if (!existingPrice) {
          try {
            const price = await stripe.prices.create({
              product: product.id,
              unit_amount: totalAmount,
              currency: 'eur',
              recurring: {
                interval: product.metadata.type === 'monthly' ? 'month' : 'year',
                interval_count: 1,
              },
              metadata: {
                aircraft_count: aircraft.toString(),
                type: product.metadata.type,
                unit_price: unitAmount.toString(),
                total_price: totalAmount.toString()
              },
              nickname: `${aircraft} Aircraft${aircraft > 1 ? 's' : ''} - ${product.metadata.type === 'monthly' ? 'Monthly' : 'Yearly'}`
            });
            prices.push(price);
            console.log(`Created price for ${aircraft} aircraft (${product.metadata.type})`);
          } catch (error) {
            console.error(`Error creating price for ${aircraft} aircraft:`, error);
          }
        } else {
          console.log(`Price already exists for ${aircraft} aircraft (${product.metadata.type})`);
        }
      }
      
      return {
        ...product,
        prices: prices
      };
    }));

    return NextResponse.json({
      success: true,
      products: productsWithPrices,
      total: productsWithPrices.length
    });

  } catch (error) {
    console.error('Error fetching/creating Stripe products:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch/create Stripe products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 