import { db } from '../db';

export async function getPostById(id: string) {
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('is_removed', false)
    .single();

  if (error) throw error;
  return data;
}

export async function getPostsByCommunity(communityId: string) {
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('community_id', communityId)
    .eq('is_removed', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

import { PostInput } from '../schemas/postSchema';

export async function createPost(postData: PostInput) {

  const { data, error } = await db
    .from('posts')
    .insert([postData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function softDeletePost(id: string) {
  const { error } = await db
    .from('posts')
    .update({ is_removed: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function getAllPosts({ limit = 10, offset = 0, type }: {
    limit?: number;
    offset?: number;
    type?: string;
  }) {
    let query = db
      .from('posts')
      .select('*')
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  
    if (type) {
      query = query.eq('content_type', type);
    }
  
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  
  