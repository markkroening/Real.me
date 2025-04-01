import { db } from '../db';

// This is what we actually insert into the DB:
export type CreateCommentInput = {
  author_id: string;     // set from token
  post_id: string;
  content: string;
  parent_comment_id?: string;  // optional for replies
};

export async function createComment(commentData: CreateCommentInput) {
  // Insert exactly what the DB expects
  const { data, error } = await db
    .from('comments')
    .insert([commentData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCommentsByPostId(postId: string) {
  const { data, error } = await db
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_removed', false)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function softDeleteComment(commentId: string) {
  const { error } = await db
    .from('comments')
    .update({ is_removed: true })
    .eq('id', commentId);

  if (error) throw error;
}

export async function getCommentById(id: string) {
  const { data, error } = await db
    .from('comments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
