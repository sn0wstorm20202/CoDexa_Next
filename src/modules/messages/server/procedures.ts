import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
      }),
    )
    .query(async ({ input }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          fragment: true,
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
        projectId: z.string().min(1, { message: "Project ID is required" }),
        enhance: z.boolean().optional().default(false), // <-- NEW flag
      }),
    )
    .mutation(async ({ input }) => {
      // 1. Save user’s raw message first
      const createdMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: "USER",
          type: "RESULT",
        },
      });

      if (input.enhance) {
        // Fire enhance first → that will trigger code-agent/run later
        await inngest.send({
          name: "code-agent/enhance",
          data: {
            value: input.value,
            projectId: input.projectId,
          },
        });
      } else {
        // Run directly without enhancement
        await inngest.send({
          name: "code-agent/run",
          data: {
            value: input.value,
            projectId: input.projectId,
          },
        });
      }

      return createdMessage;
    }),
});
