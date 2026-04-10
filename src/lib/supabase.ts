import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = "https://jtfwavoevjxzwjpegktw.supabase.co";


const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Zndhdm9ldmp4endqcGVna3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDg3NzQsImV4cCI6MjA4OTkyNDc3NH0.eXG-qMOXFTtlV3Xn-_RcDTUbkNp3GtmfaDrpcHXnSw4";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

