import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

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
export async function POST(request: Request) {
  try {
    console.log('POST /api/air-clubs - Starting request');
    
    const supabase = await createClient();
    console.log('Supabase client created');
    
    // Get current user for authentication
    const user = await getCurrentUser();
    console.log('User authentication result:', user ? 'Authenticated' : 'Not authenticated');
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, address, phone, email, airport, description, website } = body;

    // Validate required fields
    if (!name || !email || !airport) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, and airport are required' 
      }, { status: 400 });
    }

    // Get current UTC timestamp
    const utcTimestamp = new Date().toISOString();
    
    console.log('Creating air club with data:', {
      name,
      addr: address,
      phone,
      email,
      airport,
      description,
      website,
      created_by: user.id,
      plan_name: 'Free',
      subscription_status: 'inactive',
      created_at: utcTimestamp,
    });

    // Create new air club
    const { data: newAirClub, error } = await supabase
      .from('air_club')
      .insert({
        name,
        address: address, // Try using 'address' instead of 'addr'
        phone,
        email,
        airport,
        description,
        website,
        created_by: user.id,
        plan_name: 'Free',
        subscription_status: 'inactive',
        created_at: utcTimestamp, // Set UTC timestamp explicitly
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating air club:', error);
      return NextResponse.json({ error: `Failed to create air club: ${error.message}` }, { status: 500 });
    }

    console.log('Air club created successfully:', newAirClub);
    return NextResponse.json(newAirClub, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/air-clubs:', error);
    return NextResponse.json({ error: `Internal server error: ${error}` }, { status: 500 });
  }
} 