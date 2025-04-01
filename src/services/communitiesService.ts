import { db } from '../db.js';

type NewCommunity = {
    name: string;
    description?: string;
    authoritarian?: boolean;
    owner_id: string;
    theme_id?: string;
  };

export async function createCommunity(community: NewCommunity) {
  const { data, error } = await db.from('communities').insert(community).select();
  if (error) throw new Error(error.message);
  return data?.[0];
}

export async function getAllCommunities() {
  const { data, error } = await db.from('communities').select('*');
  if (error) throw new Error(error.message);
  return data;
}

export async function getCommunityById(id: string) {
    const { data, error } = await db.from('communities').select('*').eq('id', id).single();
  
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
  
    return data ?? null;
  }
  