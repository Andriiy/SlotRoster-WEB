import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Type definitions for your existing tables
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          user_id: string;
          air_club_id: string | null;
          full_name: string | null;
          email: string;
          is_admin: boolean;
          is_pilot: boolean;
          is_instructor: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          user_id: string;
          air_club_id?: string | null;
          full_name?: string | null;
          email: string;
          is_admin?: boolean;
          is_pilot?: boolean;
          is_instructor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          user_id?: string;
          air_club_id?: string | null;
          full_name?: string | null;
          email?: string;
          is_admin?: boolean;
          is_pilot?: boolean;
          is_instructor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      air_club: {
        Row: {
          id: string;
          name: string;
          addr: string | null;
          phone: string | null;
          email: string | null;
          airport: string | null;
          description: string | null;
          website: string | null;
          created_by: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_product_id: string | null;
          plan_name: string | null;
          subscription_status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          addr?: string | null;
          phone?: string | null;
          email?: string | null;
          airport?: string | null;
          description?: string | null;
          website?: string | null;
          created_by?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_product_id?: string | null;
          plan_name?: string | null;
          subscription_status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          addr?: string | null;
          phone?: string | null;
          email?: string | null;
          airport?: string | null;
          description?: string | null;
          website?: string | null;
          created_by?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_product_id?: string | null;
          plan_name?: string | null;
          subscription_status?: string | null;
          created_at?: string;
        };
      };
      aircrafts: {
        Row: {
          id: string;
          registration: string;
          aircraft_type: string | null;
          se: number | null;
          engine: string | null;
          air_club_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          registration: string;
          aircraft_type?: string | null;
          se?: number | null;
          engine?: string | null;
          air_club_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          registration?: string;
          aircraft_type?: string | null;
          se?: number | null;
          engine?: string | null;
          air_club_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          aircraft_id: string;
          start_time: string;
          end_time: string;
          status: string;
          air_club_id: string;
          notes: string | null;
          inserted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          aircraft_id: string;
          start_time: string;
          end_time: string;
          status?: string;
          air_club_id: string;
          notes?: string | null;
          inserted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          aircraft_id?: string;
          start_time?: string;
          end_time?: string;
          status?: string;
          air_club_id?: string;
          notes?: string | null;
          inserted_at?: string;
        };
      };
      instructor_availability: {
        Row: {
          id: string;
          instructor_id: string;
          air_club_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instructor_id: string;
          air_club_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          instructor_id?: string;
          air_club_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          club_name: string | null;
          aircraft_count: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          club_name?: string | null;
          aircraft_count?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          club_name?: string | null;
          aircraft_count?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AirClub = Database['public']['Tables']['air_club']['Row'];
export type Aircraft = Database['public']['Tables']['aircrafts']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type InstructorAvailability = Database['public']['Tables']['instructor_availability']['Row'];
export type Waitlist = Database['public']['Tables']['waitlist']['Row'];
 