
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ofkxkidehimzoblxmvkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ma3hraWRlaGltem9ibHhtdmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Njg0NzcsImV4cCI6MjA1NjM0NDQ3N30.K8erEb4ZA8NkWy6gk3YNwP0AnWivxjq8FXHTmaU_W1o';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];
