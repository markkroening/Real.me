import { z } from 'zod';

export const PostSchema = z.object({
  author_id: z.string().uuid(),
  community_id: z.string().uuid(),
  content: z.string().min(1),
  content_type: z.enum(['text', 'image', 'video', 'link']),
  metadata: z.any().optional()
});

export type PostInput = z.infer<typeof PostSchema>;
