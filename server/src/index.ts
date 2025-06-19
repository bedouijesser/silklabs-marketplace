
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createIdeaInputSchema,
  updateUserInputSchema,
  createRoleInputSchema,
  createApplicationInputSchema
} from './schema';

// Import handlers
import { createIdea } from './handlers/create_idea';
import { getIdeaById } from './handlers/get_idea_by_id';
import { getAllIdeas } from './handlers/get_all_ideas';
import { getUserById } from './handlers/get_user_by_id';
import { updateUserProfile } from './handlers/update_user_profile';
import { createRole } from './handlers/create_role';
import { applyForRole } from './handlers/apply_for_role';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Idea handlers
  createIdea: publicProcedure
    .input(createIdeaInputSchema)
    .mutation(({ input }) => createIdea(input)),
  
  getIdeaById: publicProcedure
    .input(z.number())
    .query(({ input }) => getIdeaById(input)),
  
  getAllIdeas: publicProcedure
    .query(() => getAllIdeas()),
  
  // User handlers
  getUserById: publicProcedure
    .input(z.number())
    .query(({ input }) => getUserById(input)),
  
  updateUserProfile: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUserProfile(input)),
  
  // Role handlers
  createRole: publicProcedure
    .input(createRoleInputSchema)
    .mutation(({ input }) => createRole(input)),
  
  // Application handlers
  applyForRole: publicProcedure
    .input(createApplicationInputSchema)
    .mutation(({ input }) => applyForRole(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
