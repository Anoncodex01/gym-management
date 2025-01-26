import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://svxokwxdhdgjdwepsftt.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eG9rd3hkaGRnamR3ZXBzZnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NjQ4NTQsImV4cCI6MjA1MzE0MDg1NH0.LuPtR0jl2PHa4WI-BfbEsaHWPQObhFPB_qf5dVmiqes';

// Log the environment variables (for debugging)
console.log('Environment Setup:', {
  supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  envVars: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? '[EXISTS]' : '[MISSING]',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? '[EXISTS]' : '[MISSING]'
  }
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);