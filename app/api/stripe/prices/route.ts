import { NextResponse } from 'next/server';
import { getStripePrices } from '@/lib/payments/stripe';

export async function GET() {
  try {
    const prices = await getStripePrices();
    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching Stripe prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
} 