import { createTRPCRouter } from '../init';
import { projectsRouter } from '@/modules/projects/server/procedures';

import { messagesRouter } from '@/modules/messages/server/procedures';

export const appRouter = createTRPCRouter({
   messages:messagesRouter,
    projects: projectsRouter,
    // Add other routers here as needed
    // fragment:fragmentRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;