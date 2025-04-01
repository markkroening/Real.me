import { db } from '../db.js';

type NewUser = {
  real_name: string;
  birth_date: string;
  region: string;
  verified: boolean;
  sso_links?: Record<string, string>;
};

export async function createUser(user: NewUser) {
  const { data, error } = await db.from('users').insert(user).select();
  if (error) throw new Error(error.message);
  return data?.[0];
}

export async function getAllUsers() {
  const { data, error } = await db.from('users').select('*');
  if (error) throw new Error(error.message);
  return data;
}

export async function getUserById(id: string) {
    const { data, error } = await db.from('users').select('*').eq('id', id).single();
  
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
  
    return data ?? null;
  }
  