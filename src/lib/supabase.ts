import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ofkxkidehimzoblxmvkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ma3hraWRlaGltem9ibHhtdmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Njg0NzcsImV4cCI6MjA1NjM0NDQ3N30.K8erEb4ZA8NkWy6gk3YNwP0AnWivxjq8FXHTmaU_W1o';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];

export type UserDataTables = {
  bmi_history: {
    id: string;
    user_id: string;
    bmi: number;
    category: string;
    date: string;
    height?: number;
    weight?: number;
  };
  food_comparisons: {
    id: string;
    user_id: string;
    food1: string;
    food2: string;
    date: string;
    notes?: string;
  };
  meal_recognitions: {
    id: string;
    user_id: string;
    meal_name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    date: string;
    image_url?: string;
  };
  sleep_data: {
    id: string;
    user_id: string;
    duration: number;
    quality: number;
    date: string;
    notes?: string;
  };
  user_profiles: {
    id: string;
    user_id: string;
    name: string;
    avatar_url?: string;
    created_at: string;
    goals?: string[];
  };
};
