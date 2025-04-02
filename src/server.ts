import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import usersRoutes from './routes/users.js';
import communitiesRoutes from './routes/communities.js';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';

const app = Fastify();

app.register(usersRoutes, { prefix: '/users' });
app.register(communitiesRoutes, { prefix: '/communities' });
app.register(postRoutes, { prefix: '/posts' });
app.register(commentRoutes, { prefix: '/comments' });
app.register(jwt, {
    secret: process.env.SUPABASE_JWT_SECRET as string
  });

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Real.me API running at ${address}`);
});
