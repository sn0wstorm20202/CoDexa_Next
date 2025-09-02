import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { codeAgentFunction } from "@/inngest/function";
import { promptEnhancerFunction } from "@/inngest/function"; // <- import enhancer

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    codeAgentFunction,
    promptEnhancerFunction, // <- add it here
  ],
});
