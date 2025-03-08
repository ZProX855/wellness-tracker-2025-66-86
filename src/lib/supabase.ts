
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ofkxkidehimzoblxmvkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ma3hraWRlaGltem9ibHhtdmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Njg0NzcsImV4cCI6MjA1NjM0NDQ3N30.K8erEb4ZA8NkWy6gk3YNwP0AnWivxjq8FXHTmaU_W1o';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];

// Define the database schema types for typesafe queries
export type Database = {
  public: {
    Tables: {
      bmi_history: {
        Row: {
          id: string;
          user_id: string;
          bmi: number;
          category: string;
          date: string;
          height: number;
          weight: number;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bmi: number;
          category: string;
          date: string;
          height: number;
          weight: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bmi?: number;
          category?: string;
          date?: string;
          height?: number;
          weight?: number;
          created_at?: string;
        };
      };
      food_comparisons: {
        Row: {
          id: string;
          user_id: string;
          food1: string;
          food2: string;
          date: string;
          notes?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food1: string;
          food2: string;
          date: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food1?: string;
          food2?: string;
          date?: string;
          notes?: string;
          created_at?: string;
        };
      };
      meal_recognitions: {
        Row: {
          id: string;
          user_id: string;
          meal_name: string;
          calories: number;
          proteins: number;
          carbs: number;
          fats: number;
          date: string;
          image_url?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_name: string;
          calories: number;
          proteins: number;
          carbs: number;
          fats: number;
          date: string;
          image_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_name?: string;
          calories?: number;
          proteins?: number;
          carbs?: number;
          fats?: number;
          date?: string;
          image_url?: string;
          created_at?: string;
        };
      };
      sleep_data: {
        Row: {
          id: string;
          user_id: string;
          duration: number;
          quality: number;
          date: string;
          notes?: string;
          bed_time: string;
          wake_time: string;
          factors?: string[];
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          duration: number;
          quality: number;
          date: string;
          notes?: string;
          bed_time: string;
          wake_time: string;
          factors?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          duration?: number;
          quality?: number;
          date?: string;
          notes?: string;
          bed_time?: string;
          wake_time?: string;
          factors?: string[];
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          goals?: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          goals?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          avatar_url?: string;
          created_at?: string;
          goals?: string[];
        };
      };
    };
  };
};

export type DbTables = Database['public']['Tables'];

// Export a type for each table's row type for easy access
export type UserDataTables = {
  bmi_history: DbTables['bmi_history']['Row'];
  food_comparisons: DbTables['food_comparisons']['Row'];
  meal_recognitions: DbTables['meal_recognitions']['Row'];
  sleep_data: DbTables['sleep_data']['Row'];
  user_profiles: DbTables['user_profiles']['Row'];
};
