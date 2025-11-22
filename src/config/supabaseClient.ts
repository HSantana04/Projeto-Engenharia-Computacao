import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jhyirqtukcecevtzjzhq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWlycXR1a2NlY2V2dHpqemhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Njg0NjksImV4cCI6MjA3OTM0NDQ2OX0.HzFlfAppGI7m9ukXJy0bthE8bruvtqa13GmZz7rJxCg";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);