import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

// PUT - Update air club
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user for authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, address, phone, email, airport, description, website } = body;

    // Validate required fields
    if (!name || !email || !airport) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, and airport are required' 
      }, { status: 400 });
    }

    // Update air club
    const { data: updatedAirClub, error } = await supabase
      .from('air_club')
      .update({
        name,
        address: address, // Try using 'address' instead of 'addr'
        phone,
        email,
        airport,
        description,
        website,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating air club:', error);
      return NextResponse.json({ error: 'Failed to update air club' }, { status: 500 });
    }

    if (!updatedAirClub) {
      return NextResponse.json({ error: 'Air club not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAirClub);
  } catch (error) {
    console.error('Error in PUT /api/air-clubs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete air club
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user for authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Delete air club
    const { error } = await supabase
      .from('air_club')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting air club:', error);
      return NextResponse.json({ error: 'Failed to delete air club' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Air club deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/air-clubs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 