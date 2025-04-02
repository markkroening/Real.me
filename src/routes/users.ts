import { FastifyInstance } from 'fastify';
import { getProfileByUserId, createProfile } from '../services/profileService';
import { z } from 'zod';

const userSchema = z.object({
  real_name: z.string().min(1),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // e.g., 1990-05-12
  region: z.string(),
  verified: z.boolean(),
  sso_links: z.record(z.string(), z.string()).optional()
});

export default async function usersRoutes(fastify: FastifyInstance) {
  // GET /users
  fastify.get('/', async () => {
    return getAllProfiles();
  });

  // GET /users/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await getProfileByUserId(id);

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return user;
  });

  // POST /users
  fastify.post('/', async (request, reply) => {
    const parseResult = userSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: 'Invalid user data',
        issues: parseResult.error.issues,
      });
    }

    const user = await createUser(parseResult.data);
    reply.code(201).send(user);
  });
}
