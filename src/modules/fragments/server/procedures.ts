import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSandbox } from "@/inngest/utils";

export const fragmentsRouter = createTRPCRouter({
    updateFiles: baseProcedure
        .input(z.object({
            fragmentId: z.string().min(1, { message: "Fragment ID is required" }),
            files: z.record(z.string(), z.string()).refine(
                (files) => Object.keys(files).length > 0,
                { message: "At least one file is required" }
            )
        }))
        .mutation(async ({ input }) => {
            try {
                // First, get the fragment to access the sandbox
                const fragment = await prisma.fragment.findUnique({
                    where: { id: input.fragmentId },
                    include: { message: true }
                });

                if (!fragment) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Fragment not found"
                    });
                }

                // Extract sandbox ID from URL - E2B uses different URL formats
                console.log("Fragment sandbox URL:", fragment.sandboxUrl);
                
                let sandboxId: string | undefined;
                
                // Pattern 1: https://{port}-{sandboxId}.e2b.app (current format)
                const e2bAppMatch = fragment.sandboxUrl.match(/https:\/\/\d+-([a-zA-Z0-9]+)\.e2b\.app/);
                if (e2bAppMatch) {
                    sandboxId = e2bAppMatch[1];
                }
                
                // Pattern 2: https://{sandboxId}.e2b.dev (legacy format)
                if (!sandboxId) {
                    sandboxId = fragment.sandboxUrl.match(/https:\/\/([^.-]+)\.e2b\.dev/)?.[1];
                }
                
                // Pattern 3: https://{sandboxId}-3000.{host}.e2b.dev (another legacy format)
                if (!sandboxId) {
                    sandboxId = fragment.sandboxUrl.match(/https:\/\/([^.-]+)-\d+\.[^.]+\.e2b\.dev/)?.[1];
                }
                
                console.log("Extracted sandbox ID:", sandboxId);
                
                if (!sandboxId) {
                    console.error("Failed to extract sandbox ID from URL:", fragment.sandboxUrl);
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `Invalid sandbox URL format: ${fragment.sandboxUrl}`
                    });
                }

                // Update files in E2B sandbox
                let sandboxUpdateSuccess = false;
                try {
                    console.log("Connecting to sandbox:", sandboxId);
                    const sandbox = await getSandbox(sandboxId);
                    console.log("Sandbox connected successfully");
                    
                    // Update each file in the sandbox
                    for (const [filePath, content] of Object.entries(input.files)) {
                        console.log(`Updating file in sandbox: ${filePath}`);
                        await sandbox.files.write(filePath, content);
                        console.log(`File updated successfully: ${filePath}`);
                    }
                    sandboxUpdateSuccess = true;
                    console.log("All sandbox files updated successfully");
                } catch (sandboxError) {
                    console.error("Failed to update sandbox files:", sandboxError);
                    // Continue to update database even if sandbox update fails
                }

                // Update the fragment in the database
                const updatedFragment = await prisma.fragment.update({
                    where: { id: input.fragmentId },
                    data: {
                        files: input.files,
                        updatedAt: new Date()
                    }
                });

                return {
                    success: true,
                    fragment: updatedFragment,
                    sandboxUpdateSuccess,
                    message: sandboxUpdateSuccess 
                        ? "Files updated successfully in both database and sandbox"
                        : "Files updated in database only - sandbox update failed"
                };

            } catch (error) {
                console.error("Error updating fragment files:", error);
                
                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update files"
                });
            }
        }),

    updateSingleFile: baseProcedure
        .input(z.object({
            fragmentId: z.string().min(1, { message: "Fragment ID is required" }),
            filePath: z.string().min(1, { message: "File path is required" }),
            content: z.string()
        }))
        .mutation(async ({ input }) => {
            console.log('🚀 updateSingleFile - Starting update for:', {
                fragmentId: input.fragmentId,
                filePath: input.filePath,
                contentLength: input.content.length,
                timestamp: new Date().toISOString()
            });
            
            try {
                // Get current fragment
                console.log('📋 Fetching fragment from database:', input.fragmentId);
                const fragment = await prisma.fragment.findUnique({
                    where: { id: input.fragmentId }
                });

                if (!fragment) {
                    console.error('❌ Fragment not found:', input.fragmentId);
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Fragment not found"
                    });
                }
                
                console.log('✅ Fragment found:', {
                    id: fragment.id,
                    sandboxUrl: fragment.sandboxUrl,
                    currentFilesCount: Object.keys(fragment.files as object || {}).length
                });

                // Get current files
                const currentFiles = typeof fragment.files === 'object' && fragment.files !== null 
                    ? fragment.files as Record<string, string>
                    : {};

                // Update the specific file
                const updatedFiles = {
                    ...currentFiles,
                    [input.filePath]: input.content
                };

                // Extract sandbox ID and update sandbox
                console.log("Single file update - Fragment sandbox URL:", fragment.sandboxUrl);
                
                let sandboxId: string | undefined;
                
                // Pattern 1: https://{port}-{sandboxId}.e2b.app (current format)
                const e2bAppMatch = fragment.sandboxUrl.match(/https:\/\/\d+-([a-zA-Z0-9]+)\.e2b\.app/);
                if (e2bAppMatch) {
                    sandboxId = e2bAppMatch[1];
                }
                
                // Pattern 2: https://{sandboxId}.e2b.dev (legacy format)  
                if (!sandboxId) {
                    sandboxId = fragment.sandboxUrl.match(/https:\/\/([^.-]+)\.e2b\.dev/)?.[1];
                }
                
                // Pattern 3: https://{sandboxId}-3000.{host}.e2b.dev (another legacy format)
                if (!sandboxId) {
                    sandboxId = fragment.sandboxUrl.match(/https:\/\/([^.-]+)-\d+\.[^.]+\.e2b\.dev/)?.[1];
                }
                
                console.log("Extracted sandbox ID for single file:", sandboxId);
                
                let sandboxUpdateSuccess = false;
                if (sandboxId) {
                    try {
                        console.log(`Connecting to sandbox for file update: ${input.filePath}`);
                        const sandbox = await getSandbox(sandboxId);
                        await sandbox.files.write(input.filePath, input.content);
                        sandboxUpdateSuccess = true;
                        console.log(`File updated successfully in sandbox: ${input.filePath}`);
                    } catch (sandboxError) {
                        console.error("Failed to update sandbox file:", sandboxError);
                    }
                } else {
                    console.error("No sandbox ID found for file update");
                }

                // Update database
                console.log('💾 Updating database with new files...');
                console.log('📁 Updated files structure:', Object.keys(updatedFiles));
                
                const updatedFragment = await prisma.fragment.update({
                    where: { id: input.fragmentId },
                    data: {
                        files: updatedFiles,
                        updatedAt: new Date()
                    }
                });
                
                console.log('✅ Database updated successfully');
                
                const result = {
                    success: true,
                    fragment: updatedFragment,
                    filePath: input.filePath,
                    sandboxUpdateSuccess,
                    message: sandboxUpdateSuccess
                        ? `File ${input.filePath} updated successfully in both database and sandbox`
                        : `File ${input.filePath} updated in database only - sandbox update failed`
                };
                
                console.log('🎉 updateSingleFile completed:', {
                    success: result.success,
                    sandboxUpdateSuccess,
                    message: result.message
                });
                
                return result;

            } catch (error) {
                console.error("Error updating single file:", error);
                
                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update file"
                });
            }
        })
});