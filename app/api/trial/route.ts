import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startFreeTrial, checkTrialStatus, getTrialDaysRemaining, canAddAircraft } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const { airClubId, planName, aircraftLimit = 999 } = await request.json();
    
    if (!airClubId || !planName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const airClub = await startFreeTrial(airClubId, planName, aircraftLimit);
    
    return NextResponse.json({
      success: true,
      airClub,
      message: 'Free trial started successfully with unlimited aircraft'
    });
  } catch (error) {
    console.error('Error starting free trial:', error);
    return NextResponse.json(
      { error: 'Failed to start free trial' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const airClubId = searchParams.get('airClubId');
    
    if (!airClubId) {
      return NextResponse.json(
        { error: 'Air club ID is required' },
        { status: 400 }
      );
    }
    
    const airClub = await checkTrialStatus(airClubId);
    const daysRemaining = await getTrialDaysRemaining(airClubId);
    const canAdd = await canAddAircraft(airClubId);
    
    return NextResponse.json({
      airClub,
      trialDaysRemaining: daysRemaining,
      canAddAircraft: canAdd,
      isTrialActive: airClub.is_trial_active
    });
  } catch (error) {
    console.error('Error checking trial status:', error);
    return NextResponse.json(
      { error: 'Failed to check trial status' },
      { status: 500 }
    );
  }
} 