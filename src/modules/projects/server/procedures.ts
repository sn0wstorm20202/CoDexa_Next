import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs"
import { tr } from "date-fns/locale";
import { trpc } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { c } from "node_modules/@inngest/agent-kit/dist/agent-Df6e3z3X";


export const projectsRouter = createTRPCRouter({
    getMany: protectedProcedure
        .query(async ({ctx}) => {
            // Return a list of projects, ordered by recent update.
            // Select only fields the client needs to keep payload small.
            const projects = await prisma.project.findMany({
                where: {
                    userId: ctx.auth.userId,
                },
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return projects;
        }),
    // The above edit has done by Somsubhra During Home page development
    getOne: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Project ID is required" }),
        }))
        .query(async ({ input ,ctx}) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId,
                },
            });
            if (!existingProject) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
            }
            return existingProject;
        }),


    create: protectedProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, { message: "Value is required" })
                    .max(10000, { message: "Value is too long" }),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const createdProject = await prisma.project.create({
                data: {
                    userId: ctx.auth.userId,
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