import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
    getOne: baseProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Project ID is required" }),
        }))
        .query(async ({ input }) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.id,
                },
            });
            if (!existingProject) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
            }
            return existingProject;
        }),

    create: baseProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, { message: "Value is required" })
                    .max(10000, { message: "Value is too long" }),
                // --- ADD THIS ---
                enhance: z.boolean().optional().default(false), 
            }),
        )
        .mutation(async ({ input }) => {
            console.log("📦 tRPC 'projectsRouter' received input:", input); // For debugging

            const createdProject = await prisma.project.create({
                data: {
                    name: generateSlug(2, {
                        format: "kebab",
                    }),
                    // This creates the project AND the first user message in one go
                    messages: {
                        create: {
                            content: input.value,
                            role: "USER",
                            type: "RESULT",
                        },
                    },
                }
            });

            // --- WRAP THE INNGEST CALL IN THIS LOGIC ---
            if (input.enhance) {
                // If enhance is true, fire the enhance event first
                console.log("🚀 Firing enhancement event...");
                await inngest.send({
                    name: "code-agent/enhance",
                    data: {
                        value: input.value,
                        projectId: createdProject.id, // Pass the new project's ID
                    },
                });
            } else {
                // Otherwise, run the code agent directly
                console.log("🏃 Firing run event directly...");
                await inngest.send({
                    name: "code-agent/run",
                    data: {
                        value: input.value,
                        projectId: createdProject.id, // Pass the new project's ID
                    },
                });
            }
            
            return createdProject;
        }),
});
