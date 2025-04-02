import { FastifyInstance } from 'fastify';
import {
  getCommentsByPostId,
  createComment,
  getCommentById,
  softDeleteComment
} from '../services/commentsService';

import { CommentSchema } from '../schemas/commentSchema';
import { requireAuth } from '../utils/auth';

export default async function commentRoutes(fastify: FastifyInstance) {
  // GET /comments/post/:id
  fastify.get('/post/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const comments = await getCommentsByPostId(id);
      return comments;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch comments' });
    }
  });

  // POST /comments (requires auth)
  fastify.post('/', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const parseResult = CommentSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          issues: parseResult.error.errors
        });
      }

      // parseResult.data is typed from our Zod schema
      const validatedBody = parseResult.data;
      const userId = (request.user as any).sub; // from JWT token

      // Merge the token user ID into the final data we send to createComment
      const finalComment = {
        ...validatedBody,
        author_id: userId
      };

      // Now finalComment exactly matches CreateCommentInput
      const newComment = await createComment(finalComment);
      return reply.code(201).send(newComment);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create comment' });
    }
  });

  // DELETE /comments/:id (protected)
  fastify.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).sub;

      const comment = await getCommentById(id);
      if (!comment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }

      if (comment.author_id !== userId) {
        return reply.code(403).send({ error: 'You are not allowed to delete this comment' });
      }

      await softDeleteComment(id);
      return reply.code(204).send();
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete comment' });
    }
  });
}
