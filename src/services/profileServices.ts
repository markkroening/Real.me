import { supabase } from '../lib/supabase';

export type Profile = {
  id?: string;                  // profile table's primary key (optional if auto-generated)
  user_id: string;             // links to Supabase Auth user
  real_name: string;
  birth_date: string;          // ISO format (YYYY-MM-DD)
  region: string;
  verified: boolean;
  sso_links?: Record<string, string>;
};

/**
 * Create a new profile for a user
 */
export async function createProfile(profile: Profile): Promise<Profile> {
  const { data, error } = await supabase
    .from('profile')
    .insert(profile)
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return data;
}

/**
 * Get a profile by the Supabase Auth user ID
 */
export async function getProfileByUserId(user_id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data ?? null;
}

/**
 * Get all profiles
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profile')
    .select('*');

  if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);
  return data as Profile[];
}
