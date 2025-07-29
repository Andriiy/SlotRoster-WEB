import { createClient } from '@/lib/supabase/server';

export type User = {
  id: string;
  email: string;
  name?: string;
  profileId: string;
  airClubId?: string;
  isAdmin: boolean;
  isPilot: boolean;
  isInstructor: boolean;
};

export type AirClub = {
  id: string;
  name: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_product_id?: string;
  plan_name?: string;
  subscription_status?: string;
};

export type Profile = {
  id: string;
  user_id: string;
  air_club_id?: string;
  full_name?: string;
  email: string;
  is_admin: boolean;
  is_pilot: boolean;
  is_instructor: boolean;
};

export type AirClubWithMembers = AirClub & {
  profiles: Profile[];
};

export type ActionState = {
  error?: string;
  success?: string;
  email?: FormDataEntryValue | null;
  password?: FormDataEntryValue | null;
  fullName?: FormDataEntryValue | null;
  clubName?: FormDataEntryValue | null;
  inviteId?: FormDataEntryValue | null;
};

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Get profile (optional - user might not have a profile yet)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.display_name || profile?.name || profile?.full_name || user.user_metadata?.full_name,
    profileId: profile?.id || '',
    airClubId: profile?.air_club_id,
    isAdmin: profile?.is_admin || false,
    isPilot: profile?.is_pilot || false,
    isInstructor: profile?.is_instructor || false,
  };
}

export async function getCurrentUserWithAirClub(): Promise<{ user: User; airClub: AirClub | null } | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  if (!user.airClubId) {
    return { user, airClub: null };
  }

  const supabase = await createClient();
  const { data: airClub } = await supabase
    .from('air_club')
    .select('*')
    .eq('id', user.airClubId)
    .single();

  return { user, airClub };
}

export async function getAirClubWithMembers(airClubId: string): Promise<AirClubWithMembers | null> {
  const supabase = await createClient();
  
  const { data: airClub } = await supabase
    .from('air_club')
    .select(`
      *,
      profiles (*)
    `)
    .eq('id', airClubId)
    .single();

  return airClub;
}

// Helper function for actions that need air club context
export function withAirClub<T>(
  action: (formData: FormData, airClub: AirClub) => Promise<T>
) {
  return async (formData: FormData): Promise<T> => {
    const userWithAirClub = await getCurrentUserWithAirClub();
    if (!userWithAirClub) {
      throw new Error('Not authenticated');
    }

    if (!userWithAirClub.airClub) {
      throw new Error('No air club found');
    }

    return action(formData, userWithAirClub.airClub);
  };
}

// Helper function to validate form data with Zod
export function validatedAction<T>(
  schema: any,
  action: (data: T, formData: FormData) => Promise<any>
) {
  return async (formData: FormData) => {
    const validatedFields = schema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      fullName: formData.get('fullName'),
      clubName: formData.get('clubName'),
      inviteId: formData.get('inviteId'),
      // Add other fields as needed
    });

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields.',
        ...Object.fromEntries(formData)
      };
    }

    return action(validatedFields.data, formData);
  };
}

// Helper function to validate form data with user context
export function validatedActionWithUser<T>(
  schema: any,
  action: (data: T, formData: FormData, user: User) => Promise<any>
) {
  return async (formData: FormData) => {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated.' };
    }

    const validatedFields = schema.safeParse({
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      password: formData.get('password'),
      // Add other fields as needed
    });

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields.',
        ...Object.fromEntries(formData)
      };
    }

    return action(validatedFields.data, formData, user);
  };
}
