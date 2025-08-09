import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
    invoke: baseProcedure
        .input(z.object({
            text: z.string(),
        })
    )
        .mutation(async ({ input, ctx }) => {
            await inngest.send({
                name:"test/hello.world",
                data: {
                    text: input.text,
                },
            });
            return {
                message: "Hello, world",
            };
        }),
    createAI: baseProcedure
        .input(
            z.object({
                text: z.string(),
            }),
        )
        .query((opts) => {
            return {
                greeting: `hello ${opts.input.text}`,
            };
        }),
});
// export type definition of API
export type AppRouter = typeof appRouter;