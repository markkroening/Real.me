import { createClient } from '@supabase/supabase-js';

// Ideally this should be in a separate db.ts and imported, but keeping it simple here
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NewProfile = {
  user_id: string;          // Supabase user ID
  real_name: string;
  birth_date: string;
  region: string;
  verified: boolean;
  sso_links?: Record<string, string>;
};

export async function createProfile(profile: NewProfile) {
  const { data, error } = await supabase.from('profile').insert(profile).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getProfileByUserId(user_id: string) {
  const { data, error } = await supabase.from('profile').select('*').eq('user_id', user_id).single();
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data ?? null;
}
