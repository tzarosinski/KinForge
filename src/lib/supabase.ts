import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhihhvyfluopxcuezqhi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaWhodnlmbHVvcHhjdWV6cWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTM2NTksImV4cCI6MjA4MTY2OTY1OX0.Ned8b6-joqp92AbUO3a7zr4QiwV34YO5eZ29HesALX0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}
