import { z } from 'zod';

// The client only supplies post_id, content, optional parent_comm
export const CommentSchema = z.object({
  post_id: z.string().uuid(),
  content: z.string().min(1, 'Comment content cannot be empty'),
  parent_comm: z.string().uuid().optional() // only if you plan to store replies
});

export type CommentBody = z.infer<typeof CommentSchema>;
