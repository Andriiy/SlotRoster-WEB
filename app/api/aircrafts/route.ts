import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    
    const supabase = await createClient();
    
    const { data: aircraft, error } = await supabase
      .from('aircrafts')
      .select('*')
      .eq('air_club_id', airClubId);
      
    if (error) {
      console.error('Error fetching aircraft:', error);
      return NextResponse.json(
        { error: 'Failed to fetch aircraft' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(aircraft || []);
  } catch (error) {
    console.error('Error in aircraft API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 