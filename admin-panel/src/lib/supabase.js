import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://urzxfvhyccxkkcqbyttx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenhmdmh5Y2N4a2tjcWJ5dHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTU1MTcsImV4cCI6MjA5OTQzMTUxN30.LT_13YxAnQKi2ODXBhcYwd0Ief7sFKmaAdEV9xL3izI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
