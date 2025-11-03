import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { getSandbox } from "./utils";

/**
 * PHASE 2: Self-healing tool - checks if generated app has errors
 */
export const checkForErrors = (sandboxId: string) => createTool({
  name: "checkForErrors",
  description: "Check if the generated app has compilation or runtime errors by testing the sandbox URL. Returns error details if found.",
  parameters: z.object({
    url: z.string().describe("The sandbox URL to check (e.g., https://sandbox-xxx-3000.e2b.dev)")
  }),
  handler: async ({ url }, { step }) => {
    return await step?.run("checkForErrors", async () => {
      try {
        // Try to fetch the URL
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'CoDexa-Error-Checker/1.0'
          }
        });

        const html = await response.text();

        // Check for common Next.js error patterns
        const errorPatterns = [
          {
            pattern: /Error:|error:/i,
            type: 'general_error'
          },
          {
            pattern: /use client.*Expected.*eof/i,
            type: 'use_client_no_quotes',
            fix: 'Change `use client` to "use client" (with double quotes as a string)'
          },
          {
            pattern: /ssr: false.*is not allowed/i,
            type: 'dynamic_ssr_error',
            fix: 'Add "use client" directive at the top of the file'
          },
          {
            pattern: /Cannot use.*in Server Component/i,
            type: 'server_component_error',
            fix: 'Add "use client" directive to files using browser APIs or hooks'
          },
          {
            pattern: /Module not found/i,
            type: 'module_not_found',
            fix: 'Install missing package using terminal tool'
          },
          {
            pattern: /Unexpected token/i,
            type: 'syntax_error',
            fix: 'Check for syntax errors in the code'
          },
          {
            pattern: /"use client".*must be.*first/i,
            type: 'use_client_position',
            fix: 'Move "use client" to the very first line (before imports)'
          }
        ];

        // Check if the page loaded successfully
        if (response.ok && !html.includes('Error') && !html.includes('error')) {
          return JSON.stringify({
            success: true,
            hasError: false,
            message: 'App is running without errors'
          });
        }

        // Extract error information
        let detectedError = null;
        for (const { pattern, type, fix } of errorPatterns) {
          if (pattern.test(html)) {
            detectedError = {
              type,
              fix: fix || 'Unknown fix',
              details: html.match(pattern)?.[0] || 'Error detected'
            };
            break;
          }
        }

        if (detectedError) {
          return JSON.stringify({
            success: true,
            hasError: true,
            error: detectedError,
            recommendation: `Fix needed: ${detectedError.fix}`
          });
        }

        // Generic error if pattern not matched
        return JSON.stringify({
          success: true,
          hasError: true,
          error: {
            type: 'unknown_error',
            fix: 'Check the error message in browser console',
            details: 'Error detected but pattern not recognized'
          }
        });

      } catch (e) {
        return JSON.stringify({
          success: false,
          error: `Failed to check URL: ${e}`
        });
      }
    });
  }
});

/**
 * PHASE 2: Tool to read error logs from sandbox
 */
export const readErrorLogs = (sandboxId: string) => createTool({
  name: "readErrorLogs",
  description: "Read error logs from the sandbox to identify compilation or runtime errors",
  parameters: z.object({}),
  handler: async ({}, { step }) => {
    return await step?.run("readErrorLogs", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        
        // Check for .next build errors
        const result = await sandbox.commands.run(
          'cat /home/user/.next/trace 2>/dev/null || cat /home/user/.next/server/app-paths-manifest.json 2>/dev/null || echo "No error logs found"'
        );

        return JSON.stringify({
          success: true,
          logs: result.stdout || result.stderr || 'No errors found'
        });
      } catch (e) {
        return `Error reading logs: ${e}`;
      }
    });
  }
});

export const errorDetectionTools = (sandboxId: string) => [
  checkForErrors(sandboxId),
  readErrorLogs(sandboxId)
];
