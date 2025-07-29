import { NextResponse } from 'next/server';
import { getCurrentUserWithAirClub } from '@/lib/auth/middleware';

export async function GET() {
  const userWithAirClub = await getCurrentUserWithAirClub();
  
  if (!userWithAirClub) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json(userWithAirClub.airClub);
}
