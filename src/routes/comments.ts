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

  // POST /comments
  fastify.post('/', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const parseResult = CommentSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          issues: parseResult.error.errors
        });
      }

      const userId = (request.user as any).sub;

      const validatedComment = {
        ...parseResult.data,
        author_id: userId
      };

      const newComment = await createComment(validatedComment);
      return reply.code(201).send(newComment);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create comment' });
    }
  });

  // DELETE /comments/:id
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
