import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { startFreeTrial } from '@/lib/payments/stripe';
import { NextRequest } from 'next/server';

// GET - Fetch all air clubs
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user for authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch all air clubs
    const { data: airClubs, error } = await supabase
      .from('air_club')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching air clubs:', error);
      return NextResponse.json({ error: 'Failed to fetch air clubs' }, { status: 500 });
    }

    return NextResponse.json(airClubs);
  } catch (error) {
    console.error('Error in GET /api/air-clubs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new air club
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, addr, phone, email, airport, description, website } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create air club
    const { data: newAirClub, error: createError } = await supabase
      .from('air_club')
      .insert({
        name,
        addr,
        phone,
        email,
        airport,
        description,
        website,
        created_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase error creating air club:', createError);
      return NextResponse.json(
        { error: 'Failed to create air club' },
        { status: 500 }
      );
    }

    // Start free trial
    try {
      const { data: airClubWithTrial, error: trialError } = await supabase
        .from('air_club')
        .update({
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_trial_active: true,
          trial_plan_name: 'Free',
          trial_aircraft_limit: 1,
          subscription_status: 'trialing'
        })
        .eq('id', newAirClub.id)
        .select()
        .single();

      if (trialError) {
        console.error('Error starting free trial:', trialError);
      }
    } catch (trialError) {
      console.error('Error starting free trial:', trialError);
    }

    return NextResponse.json(newAirClub);
  } catch (error) {
    console.error('Error in POST /api/air-clubs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 