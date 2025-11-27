import { createClient } from '@supabase/supabase-js';

// These should be replaced with your actual Supabase project credentials
// You can find these in your Supabase Dashboard -> Project Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://icdfylawdroxekxuvkny.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZGZ5bGF3ZHJveGVreHV2a255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTU3ODksImV4cCI6MjA3OTYzMTc4OX0.9UHMpRIlo9Z2DvAF-ddPfAjsAuHWMJixzPa7OdXzvek';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
