'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/payments/stripe';



// Sign in schema
const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export async function signIn(formData: FormData) {
  const validatedFields = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields.',
      email: formData.get('email'),
      password: formData.get('password')
    };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  // Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  if (!data.user) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  // Get user profile (optional - user might not have a profile yet)
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      air_club (*)
    `)
    .eq('user_id', data.user.id)
    .single();



  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    // TODO: Implement flight club checkout session
    // return createCheckoutSession({ airClub: profile.air_club, priceId });
    redirect('/pricing');
  }

  redirect('/dashboard');
}

// Sign up schema
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(255),
  clubName: z.string().optional(),
  inviteId: z.string().optional()
});

export async function signUp(formData: FormData) {
  const validatedFields = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    clubName: formData.get('clubName'),
    inviteId: formData.get('inviteId'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields.',
      email: formData.get('email'),
      password: formData.get('password')
    };
  }

  const { email, password, fullName, clubName, inviteId } = validatedFields.data;
  const supabase = await createClient();

  // We'll let Supabase handle the duplicate user check during sign-up

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });

  if (error) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  if (!data.user) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  let airClubId: string | null = null;
  let createdAirClub: any = null;

  if (inviteId) {
    // TODO: Handle invitation logic for flight clubs
    return { error: 'Invitation system not yet implemented for flight clubs.' };
  } else if (clubName) {
    // Create a new air club
    const { data: newAirClub, error: clubError } = await supabase
      .from('air_club')
      .insert({
        name: clubName,
        created_by: data.user.id,
      })
      .select()
      .single();

    if (clubError || !newAirClub) {
      return { error: 'Failed to create air club. Please try again.' };
    }

    createdAirClub = newAirClub;
    airClubId = newAirClub.id;


  } else {
    return { error: 'Please specify a club name or join an existing club.' };
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: data.user.id,
      email,
      full_name: fullName,
      name: fullName,
      air_club_id: airClubId,
      is_admin: false,
      is_pilot: false,
      is_instructor: false,
    });

  if (profileError) {
    return {
      error: 'Failed to create profile. Please try again.',
      email,
      password
    };
  }



  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    // TODO: Implement flight club checkout session
    // return createCheckoutSession({ airClub: createdAirClub, priceId });
    redirect('/pricing');
  }

  redirect('/dashboard');
}

// Sign out function
export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  } catch (error) {
    console.error('Error signing out:', error);
    redirect('/');
  }
}

// Update profile
const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(255),
});

export async function updateProfile(formData: FormData) {
  const validatedFields = updateProfileSchema.safeParse({
    fullName: formData.get('fullName'),
  });

  if (!validatedFields.success) {
    console.error('Validation error:', validatedFields.error);
    return {
      error: 'Invalid fields.',
      fullName: formData.get('fullName'),
    };
  }

  const { fullName } = validatedFields.data;
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('User authentication error:', userError);
    return { error: 'Not authenticated.' };
  }

  // Update display_name in auth.users table only
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      display_name: fullName
    }
  });

  if (authError) {
    console.error('Failed to update auth.users display_name:', authError);
    return { error: `Failed to update profile: ${authError.message}` };
  }

  return { success: 'Profile updated successfully.' };
}

// Update password
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export async function updatePassword(formData: FormData) {
  const validatedFields = updatePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields.',
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword')
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated.' };
  }

  // Update password with Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { error: 'Failed to update password.' };
  }

  // Get user's air club for logging
  const { data: profile } = await supabase
    .from('profiles')
    .select('air_club_id')
    .eq('user_id', user.id)
    .single();



  return { success: 'Password updated successfully.' };
}

// Delete account
const deleteAccountSchema = z.object({
  password: z.string().min(8),
});

export async function deleteAccount(formData: FormData) {
  const validatedFields = deleteAccountSchema.safeParse({
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields.',
      password: formData.get('password')
    };
  }

  const { password } = validatedFields.data;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated.' };
  }

  // Get user's air club for logging before deletion
  const { data: profile } = await supabase
    .from('profiles')
    .select('air_club_id')
    .eq('user_id', user.id)
    .single();

  // Delete profile first
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', user.id);

  if (profileError) {
    return { error: 'Failed to delete profile.' };
  }

  // Delete user from Supabase Auth
  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: 'Failed to delete account.' };
  }



  await supabase.auth.signOut();
  redirect('/');
}

// Google OAuth sign in
export async function signInWithGoogle() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    });

    if (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Failed to initiate Google OAuth.');
    }

    // Redirect to the OAuth URL
    if (data?.url) {
      redirect(data.url);
    } else {
      throw new Error('No OAuth URL received.');
    }
  } catch (error) {
    console.error('Google OAuth exception:', error);
    throw new Error('An unexpected error occurred.');
  }
}
