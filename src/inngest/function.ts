/**
 * CoDexa AI Agent - Full-Stack Code Generation
 * 
 * PHASE 1: Infrastructure (templates, tools, requirement analyzer)
 * PHASE 2: Integration (integrated into this file)
 */

import { z, type ZodType } from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createTool,
  createNetwork,
  gemini,
  openai,
  type Message,
  type Tool,
  createState,
} from "@inngest/agent-kit";
import dotenv from "dotenv";
dotenv.config();

// Original prompts
import { PROMPT, RESPONSE_PROMPT, FRAGMENT_TITLE_PROMPT } from "@/prompt";
// PHASE 1: Full-stack prompt for backend-enabled apps
import { FULLSTACK_PROMPT } from "@/fullstack-prompt";
import { prisma } from "@/lib/db";

import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent, parseAgentOutput } from "./utils";
import { SANDBOX_TIMEOUt } from "./type";
import {
  getConversationMemory,
  updateConversationMemory,
  generateContextualPrompt,
  extractContextFromMessage
} from "./memory";
// PHASE 1: Full-stack tools for backend generation
import { fullStackTools } from "./fullstack-tools";
// PHASE 1: Requirement analyzer for architecture detection
import { analyzeRequirements, explainArchitectureDecision } from "./requirement-analyzer";
// PHASE 2: Error detection and self-healing tools
import { errorDetectionTools } from "./error-detection-tools";

// PHASE 2: Extended agent state to support full-stack metadata
interface AgentState {
  summary: string;
  files: { [path: string]: string };
  // PHASE 1: Architecture metadata
  architecture?: 'frontend' | 'fullstack';
  backendUrl?: string;
  dbType?: 'sqlite' | 'postgres' | null;
  dbSchema?: string;
};




export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const projectId = event.data.projectID;
    const userMessage = event.data.value;

    console.log('🚀 [AGENT] Starting agent function', {
      projectId,
      userMessageLength: userMessage?.length || 0,
      userMessagePreview: userMessage?.substring(0, 100) + (userMessage?.length > 100 ? '...' : '')
    });




    // Retrieve conversation memory
    const memory = await step.run("get-memory", async () => {
      console.log('🧠 [AGENT] Retrieving conversation memory...');
      try {
        const result = await getConversationMemory(projectId);
        console.log('🧠 [AGENT] Memory retrieved successfully:', {
          hasMemory: !!result,
          lastContext: result?.lastContext,
          currentTask: result?.currentTask,
          recentMessagesCount: result?.recentMessages?.length || 0
        });
        return result;
      } catch (error) {
        console.error('❌ [AGENT] Error retrieving memory:', error);
        return null;
      }
    });

    // Extract context from current message
    const extractedContext = await step.run("extract-context", async () => {
      console.log('🔍 [AGENT] Extracting context from message...');
      try {
        const result = extractContextFromMessage(userMessage, memory || undefined);
        console.log('🔍 [AGENT] Context extracted:', {
          context: result.context,
          task: result.task,
          isModification: result.isModification,
          domainInfoKeys: Object.keys(result.domainInfo)
        });
        return result;
      } catch (error) {
        console.error('❌ [AGENT] Error extracting context:', error);
        throw error;
      }
    });

    // // Generate enhanced prompt with context
    // const enhancedPrompt = await step.run("generate-prompt", async () => {
    //   console.log('📝 [AGENT] Generating enhanced prompt...');
    //   try {
    //     const result = generateContextualPrompt(PROMPT, memory, userMessage);
    //     console.log('📝 [AGENT] Enhanced prompt generated:', {
    //       originalPromptLength: PROMPT.length,
    //       enhancedPromptLength: result.length,
    //       hasContext: result !== PROMPT,
    //       contextAddedLength: result.length - PROMPT.length
    //     });
    //     return result;
    //   } catch (error) {
    //     console.error('❌ [AGENT] Error generating prompt:', error);
    //     return PROMPT; // Fallback to original prompt
    //   }
    // });

    // Update memory with user message
    await step.run("update-memory-user", async () => {
      console.log('💾 [AGENT] Updating memory with user message...');
      try {
        await updateConversationMemory(
          projectId,
          {
            role: "USER",
            content: userMessage,
            timestamp: new Date().toISOString()
          },
          extractedContext
        );
        console.log('✅ [AGENT] User message memory updated successfully');
      } catch (error) {
        console.error('❌ [AGENT] Error updating user message memory:', error);
        // Don't throw - continue with agent processing
      }
    });

    // ============================================================
    // PHASE 2: Analyze requirements to determine architecture
    // ============================================================
    const requirementAnalysis = await step.run("analyze-requirements", async () => {
      console.log('🔍 [AGENT] Analyzing requirements for architecture...');
      const analysis = analyzeRequirements(userMessage);
      const explanation = explainArchitectureDecision(analysis);
      console.log('🎯 [AGENT] Architecture decision:', {
        architecture: analysis.architecture,
        needsBackend: analysis.needsBackend,
        dbType: analysis.dbType,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning
      });
      return { analysis, explanation };
    });

    // 1. Spin up a new E2B sandbox
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-codexa-123-code-2");
      await sandbox.setTimeout(SANDBOX_TIMEOUt)
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run("get-previous-messages", async () => {
      const formattedMessages: Message[] = [];

      const messages = await prisma.message.findMany({
        where: {
          projectId: projectId,
        },
        orderBy: {
          createdAt: "desc", //TODO change to dsdc if ai does not understand
        },
      });

      for (const message of messages) {
        formattedMessages.push({
          type: "text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
        })
      }
      return formattedMessages;

    });

    // PHASE 2: Initialize state with architecture metadata
    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
        // PHASE 1: Track architecture type
        architecture: requirementAnalysis.analysis.architecture,
        dbType: requirementAnalysis.analysis.dbType,
      },
      {
        messages: previousMessages,
      },
    );

    // PHASE 2: Create agent with dynamic prompt based on architecture
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description:
        "An expert coding agent that can write code, run terminal commands, and summarize content. Can build both frontend-only and full-stack applications.",
      // PHASE 2: Use full-stack prompt if backend is needed
      system: requirementAnalysis.analysis.needsBackend ? FULLSTACK_PROMPT : PROMPT,
      model: openai({
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-5-mini",
        //defaultParameters: { temperature: 0.1 },

      }),
      // PHASE 2: Add tools (original + full-stack)
      tools: [
        // Original tools
        createTool({
          name: "terminal",
          description: "Use this tool to run terminal commands in the sandbox",
          parameters: z.object({
            command: z.string(),
          }) as ZodType, // ✅ Explicit typing
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
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (e) {
                  return `Error creating or updating files: ${e}`;
                }
              }
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
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
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error reading files: " + e;
              }
            });
          },
        }),
        // PHASE 2: Add full-stack tools if backend is needed
        ...(requirementAnalysis.analysis.needsBackend ? fullStackTools(sandboxId) : []),
        // PHASE 2: Add error detection and self-healing tools
        ...errorDetectionTools(sandboxId),
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
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state });


    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-5-nano",
      }),
    })

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-5-nano",
      }),
    })

    const { output: fragmentTitleOuput } = await fragmentTitleGenerator.run(result.state.data.summary);
    const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);


    

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    // PHASE 3: Get both frontend and backend URLs for full-stack apps
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    // PHASE 3: Get backend URL if this is a full-stack app
    const backendUrl = await step.run("get-backend-url", async () => {
      // Only get backend URL if architecture is fullstack
      if (result.state.data.architecture === 'fullstack') {
        const sandbox = await getSandbox(sandboxId);
        const backendHost = sandbox.getHost(8000);
        return `https://${backendHost}`;
      }
      return null;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectID, // Associate with project
            content: "Something went wrong. please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      // PHASE 2: Save with full-stack metadata
      return prisma.message.create({
        data: {
          projectId: event.data.projectID, // Associate with project
          content: parseAgentOutput(responseOutput),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: parseAgentOutput(fragmentTitleOuput),
              files: result.state.data.files,
              // PHASE 1: Architecture metadata
              architecture: result.state.data.architecture || 'frontend',
              backendUrl: backendUrl,
              dbType: result.state.data.dbType,
              dbSchema: result.state.data.dbSchema ? JSON.parse(result.state.data.dbSchema) : null,
            },
          },
        },
      });
    });

    // Update memory with assistant response
    await step.run("update-memory-assistant", async () => {
      console.log('💾 [AGENT] Updating memory with assistant response...');
      if (!isError && result.state.data.summary) {
        try {
          await updateConversationMemory(
            projectId,
            {
              role: "ASSISTANT",
              content: result.state.data.summary,
              timestamp: new Date().toISOString()
            }
          );
          console.log('✅ [AGENT] Assistant response memory updated successfully');
        } catch (error) {
          console.error('❌ [AGENT] Error updating assistant response memory:', error);
          // Don't throw - agent has already completed successfully
        }
      } else {
        console.log('⚠️ [AGENT] Skipping assistant memory update - error or no summary', {
          isError,
          hasSummary: !!result.state.data.summary
        });
      }
    });

    // PHASE 2: Return with architecture metadata
    const finalResult = {
      url: sandboxUrl,
      backendUrl: backendUrl,
      architecture: result.state.data.architecture,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };

    console.log('🎉 [AGENT] Agent function completed successfully', {
      projectId,
      architecture: result.state.data.architecture,
      sandboxUrl,
      backendUrl,
      dbType: result.state.data.dbType,
      filesCount: Object.keys(result.state.data.files || {}).length,
      hasSummary: !!result.state.data.summary,
      isError
    });

    return finalResult;
  }
);
