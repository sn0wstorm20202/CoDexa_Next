import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import { openai, createAgent, createTool, createNetwork, type Tool } from "@inngest/agent-kit";

import { PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";

import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    // 1. Spin up a new E2B sandbox
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-codexa-123-code-2");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent that can write code, run terminal commands, and summarize content.",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
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
                  }
                });
                // Prefer stdout; fallback to stderr or "No output"
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed:${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the Sandbox",
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
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {}; // Initialize as empty object
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
              } catch (e) {
                return `Error creating or updating files: ${e}`;
              }
            });
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles; // Update the network state with new files
            }
          }
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the Sandbox",
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
              } catch (e) { // Ensure error is typed and handled
                return "Error reading files: " + e;
              }
            });
          },
        })
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value);

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

    // 5. Get the public URL for the sandbox (if applicable)
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            content: "Something went wrong. please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      return prisma.message.create({
        data: {
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragments: {
            create: {
              sandboxUrl: sandboxUrl,
              title: "Fragment",
              files: result.state.data.files,
            },
          },
        },
      });
    });

    // 6. Return both the summary and sandbox link
    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);