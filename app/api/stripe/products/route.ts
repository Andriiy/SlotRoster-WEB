import { NextResponse } from 'next/server';
import { getStripeProducts } from '@/lib/payments/stripe';

export async function GET() {
  try {
    const products = await getStripeProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 