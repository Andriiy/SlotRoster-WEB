import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Client-side function to get current user
export async function getCurrentUserClient() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (error) {
    console.error('Error getting current user (client):', error);
    return null;
  }
}

// Client-side function to get session
export async function getSessionClient() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  } catch (error) {
    console.error('Error getting session (client):', error);
    return null;
  }
}

// Client-side function to sign in
export async function signInClient(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in (client):', error);
    throw error;
  }
}

// Client-side function to sign out
export async function signOutClient() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('Sign out successful');
  } catch (error) {
    console.error('Error signing out (client):', error);
    throw error;
  }
}

// Listen for auth state changes (useful for OAuth callbacks)
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
} 