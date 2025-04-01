import { FastifyInstance } from 'fastify';
import {
  getPostById,
  getPostsByCommunity,
  getAllPosts,
  createPost,
  softDeletePost
} from '../services/postsService';
import { requireAuth } from '../utils/auth';
import { PostSchema } from '../schemas/postSchema';

export default async function postRoutes(fastify: FastifyInstance) {
  // GET /posts?limit=10&offset=0&type=text
  fastify.get('/', async (request, reply) => {
    try {
      // 👉 Grab optional query params
      const { limit, offset, type } = request.query as {
        limit?: string;
        offset?: string;
        type?: string;
      };

      // 👉 Parse and clamp limit/offset for safety
      const parsedLimit = Math.min(parseInt(limit ?? '10'), 50); // Max 50
      const parsedOffset = parseInt(offset ?? '0');

      // 👉 Pass to the service function
      const posts = await getAllPosts({
        limit: parsedLimit,
        offset: parsedOffset,
        type
      });

      return posts;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to retrieve posts' });
    }
  });

  // GET /posts/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const post = await getPostById(id);
      if (!post) return reply.code(404).send({ error: 'Post not found' });
      return post;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to retrieve post' });
    }
  });

  // GET /posts/community/:communityId
  fastify.get('/community/:communityId', async (request, reply) => {
    try {
      const { communityId } = request.params as { communityId: string };
      const posts = await getPostsByCommunity(communityId);
      return posts;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to retrieve posts' });
    }
  });

  // POST /posts (protected)
  fastify.post('/', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const parseResult = PostSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          issues: parseResult.error.errors
        });
      }

      const userId = (request.user as any).sub;

      const validatedPost = {
        ...parseResult.data,
        author_id: userId
      };

      const newPost = await createPost(validatedPost);
      return reply.code(201).send(newPost);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create post' });
    }
  });

  // DELETE /posts/:id (protected + ownership check)
  fastify.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).sub;

      const post = await getPostById(id);
      if (!post) return reply.code(404).send({ error: 'Post not found' });

      if (post.author_id !== userId) {
        return reply.code(403).send({ error: 'You are not allowed to delete this post' });
      }

      await softDeletePost(id);
      return reply.code(204).send();
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete post' });
    }
  });
}
