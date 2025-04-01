import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  getAllCommunities,
  createCommunity,
  getCommunityById
} from '../services/communitiesService.js';

const communitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  authoritarian: z.boolean().optional().default(false),
  owner_id: z.string().uuid(),
  theme_id: z.string().uuid().optional()
});

export default async function communitiesRoutes(fastify: FastifyInstance) {
  // GET /communities
  fastify.get('/', async () => {
    return getAllCommunities();
  });

  // GET /communities/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const community = await getCommunityById(id);

    if (!community) {
      return reply.code(404).send({ error: 'Community not found' });
    }

    return community;
  });

  // POST /communities
  fastify.post('/', async (request, reply) => {
    const parseResult = communitySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: 'Invalid community data',
        issues: parseResult.error.issues,
      });
    }

    const community = await createCommunity(parseResult.data);
    reply.code(201).send(community);
  });
}
