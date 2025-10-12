import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs"
import { tr } from "date-fns/locale";
import { trpc } from "@/trpc/server";
import { TRPCError } from "@trpc/server";


export const projectsRouter = createTRPCRouter({
    getOne: baseProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Project ID is required" }),
        }))
        .query(async ({input}) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.id,
                },
            });
            if (!existingProject) {
                throw new TRPCError({code: "NOT_FOUND", message: "Project not found"}); 
            }
            return existingProject;
        }),


    create: baseProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, { message: "Value is required" })
                    .max(10000, { message: "Value is too long" }),
            }),
        )
        .mutation(async ({ input }) => {
            const createdProject = await prisma.project.create({
                data: {
                    name: generateSlug(2, {
                        format: "kebab", // Generates a random slug for the project name
                    }),
                    messages: {
                        create: {
                            content: input.value,
                            role: "USER",
                            type: "RESULT",
                        },
                    },
                }
            })

            await inngest.send({
                name: "code-agent/run",
                data: {
                    value: input.value,
                    projectID: createdProject.id, // Pass the project
                },
            });
            return createdProject;
        }),
});