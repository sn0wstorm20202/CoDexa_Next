import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";

export const messagesRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(
            z.object({
                projectId: z.string().min(1, { message: "Project ID is required" }), // Optional project ID
            }),
        )
        .query(async ({ input }) => {
            const messages = await prisma.message.findMany({
                where: {
                    projectId: input.projectId, // Filter by project ID
                },
                include: {
                    fragment: true, // Include fragment if needed
                },

                orderBy: {
                    updatedAt: "asc",
                },

            });
            return messages;
        }),


    create: baseProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, { message: "Value is required" })
                    .max(10000, { message: "Value is too long" }),
                projectId: z.string().min(1, { message: "Project ID is required" }), // Optional project ID
            }),
        )
        .mutation(async ({ input }) => {
            const createdMessage = await prisma.message.create({
                data: {
                    projectId: input.projectId, // Associate with project
                    content: input.value,
                    role: "USER",
                    type: "RESULT",
                },
            });

            await inngest.send({
                name: "code-agent/run",
                data: {
                    value: input.value,
                    projectID: input.projectId, // Pass the project
                },
            });
            return createdMessage;
        }),
});