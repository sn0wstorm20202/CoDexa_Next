import { createTRPCRouter } from '../init';
import { projectsRouter } from '@/modules/projects/server/procedures';

import { messagesRouter } from '@/modules/messages/server/procedures';

export const appRouter = createTRPCRouter({
   messages:messagesRouter,
    projects: projectsRouter,
    // Add other routers here as needed
    // fragments:fragmentsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;