import { inngest } from "./client";
import { openai, createAgent, createTool } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import dotenv from 'dotenv';
import { z } from "zod";
import { PROMPT } from "@/prompt";


dotenv.config();

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // 1. Spin up a new E2B sandbox
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-codexa-123-code-2", {
        apiKey: process.env.E2B_API_KEY!,
      });
      return sandbox.sandboxId;
    });

    const sandbox = await getSandbox(sandboxId);

    // 2. Define a tool that allows the agent to run terminal commands inside the sandbox
    const terminalTool = createTool({
      name: "terminal",
      description: "Use this tool to run terminal commands in the sandbox",
      parameters: z.object({
        command: z.string(),
      }),
      handler: async ({ command }, { step }) => {
        return await step?.run("terminal", async () => {
          const buffers = { stdout: "", stderr: "" };

          try {
            const sandbox = await getSandbox(sandboxId); // re-fetch in case expired
            const result = await sandbox.commands.run(command, {
              onStdout: (data: string) => {
                buffers.stdout += data;
              },
              onStderr: (data: string) => {
                buffers.stderr += data;
              },
            });

            // Prefer stdout; fallback to stderr or "No output"
            return result.stdout;
          } catch (error: any) {
            console.error("Terminal command failed:", error);
            return `Error executing command: ${error?.message || "Unknown error"}`;
          }
        });
      },
    });


    // 3. Create an agent that can summarize content and use the terminal tool
    const summarizer = createAgent({
      name: "writer",
      system: PROMPT,
      model: openai({ model: "gpt-4o" }),
      tools: [
        terminalTool,
        createTool({
          name: "createOrUpdateFiles",
          description: "create or update files in the Sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files },
            { step, network }
          ) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                // `network.step.data.files` might not be the correct way to access previous state within a tool handler.
                // If you need to persist state across tool calls, consider using the agent's memory or a dedicated state management system.
                // For now, assuming `updatedFiles` is meant to be a local accumulation.
                const updatedFiles: { [key: string]: string } = {}; // Initialize as empty object

                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
              }
              catch (error: any) { // Catch the error to prevent silent failures
                console.error("Error creating or updating files:", error);
                return `Error creating or updating files: ${error?.message || "Unknown error"}`;
              }
            });
            return newFiles; // Return the result of the step.run
          }
        }),
        createTool({
          name: "readFiles",
          description: "Read files from Sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),

          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                // Correctly iterate over array elements using 'of' instead of 'in'
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                // Corrected `JSON.stringfy` to `JSON.stringify`
                return JSON.stringify(contents);

              }
              catch (error: any) { // Ensure error is typed and handled
                console.error("Error reading files:", error);
                return `Error reading files: ${error?.message || "Unknown error"}`;
              }
            })
          }
        })
      ],
      lifecycle:{
        onResponse: async ({result,network}) => {
          const lastAssistantMessageText = 
            lastAssistantTextMessageContent(result);

            if(lastAssistantMessageText && network){
              if(lastAssistantMessageText.includes("<task_summary>")){
                network.state.data.summary = lastAssistantMessageText;
              }

            }

            return result;

        },
      } // Closing bracket for the tools array
    });

    // 4. Summarize the incoming text event
    const { output } = await summarizer.run(
      `summarize the following text: ${event.data.value}`
    );

    // 5. Get the public URL for the sandbox (if applicable)
    const sandboxurl = await step.run("get-sandbox-url", async () => {
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    // 6. Return both the summary and sandbox link
    return { output, sandboxurl };
  }
);