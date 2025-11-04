# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project type: Next.js (App Router) + TypeScript + Prisma (PostgreSQL) + tRPC + Clerk + Inngest + TanStack Query + Tailwind + shadcn/ui. Code lives under `src/`.

Common commands
- Install deps
  - npm i
- Dev server
  - npm run dev
  - App: http://localhost:3000
- Build / run
  - npm run build
  - npm start
- Lint
  - npm run lint
- Database (Prisma)
  - Generate client (required after install or schema changes): npx prisma generate
  - Create/apply dev migration: npx prisma migrate dev
  - Apply existing migrations (CI/prod): npx prisma migrate deploy
- Inngest local HTTP handler (served via Next route)
  - Provided at /api/inngest (no separate dev server needed)
- Optional: run a single UI test (if Python/pytest is available locally)
  - pytest testsprite_tests/TC001_Landing_page_renders_correctly_on_desktop.py -q

Environment
- Required env vars used in code:
  - DATABASE_URL (PostgreSQL connection for Prisma)
  - NEXT_PUBLIC_APP_URL (used by tRPC client to build server URL during SSR)
  - INNGEST_EVENT_KEY (Inngest client event key)
  - OPENAI_API_KEY (for @inngest/agent-kit openai model)
  - Clerk keys for @clerk/nextjs (per Clerk docs; typically NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY)
- After setting DATABASE_URL: run npx prisma generate then npx prisma migrate dev

High-level architecture
- App shell and providers
  - src/app/layout.tsx wraps the tree with: ClerkProvider, TRPCReactProvider (src/trpc/client.tsx), ReactQueryProvider, TooltipProvider, ThemeProvider, and Toaster.
- Routing (Next.js App Router)
  - Pages under src/app (e.g., landing in src/app/page.tsx, builder, projects/[projectId], auth routes).
  - API routes:
    - /api/trpc wired via src/app/api/trpc/[trpc]/route.ts -> tRPC fetch handler.
    - /api/inngest wired via src/app/api/inngest/route.ts -> Inngest serve({ functions }).
- Data layer (Prisma + Postgres)
  - Schema: prisma/schema.prisma defines Project, Message, Fragment, ConversationMemory.
  - Client: generated to /generated/prisma (see generator output path) and instantiated in src/lib/db.ts with a dev-time global to avoid hot-reload duplication.
- tRPC
  - Context (auth) from Clerk via src/trpc/init.ts; superjson transformer enabled.
  - App router (src/trpc/routers/_app.ts) composes feature routers from src/modules/*/server/procedures.ts.
  - Client setup in src/trpc/client.tsx: httpBatchLink + superjson; provider exposes React hooks, with TanStack Query for caching.
- Feature modules
  - Projects/messages/fragments live under src/modules/{projects|messages|fragments}/server/procedures.ts with zod validation and protectedProcedure middleware (requires Clerk user).
  - Notable flows:
    - Creating a project or message enqueues an Inngest event "code-agent/run" with project context.
    - Fragment updates can also sync files to an E2B sandbox derived from stored sandboxUrl.
- Inngest + Agent runtime
  - Client: src/inngest/client.ts (id: "vibe-development", uses INNGEST_EVENT_KEY).
  - Function: src/inngest/function.ts defines codeAgentFunction on event code-agent/run.
    - Fetches prior conversation (from Prisma), uses memory helpers (src/inngest/memory.ts), spins up or connects to an E2B sandbox, runs an agent (from @inngest/agent-kit) that can execute terminal commands and read/write files in the sandbox.
    - Generates assistant output and a fragment (files + sandboxUrl), persists Message/Fragment to DB, and updates ConversationMemory.
  - Utils: src/inngest/utils.ts handles E2B connections and output parsing; src/inngest/type.ts defines sandbox timeouts.
  - E2B template config under sandbox-templates/nextjs/e2b.toml (template_name: "vibe-codexa-123-code-2").
- UI components
  - Shared components under src/components and shadcn/ui components under src/components/ui.
  - Project-specific UI under src/modules/projects/ui (code editor, file explorer, fragments, etc.).
  - State via Zustand: src/store/uiStore.ts.
- Styling
  - Tailwind configured via tailwind.config.js; globals in src/app/globals.css and other CSS files.

Notes for agents
- When adding DB models or fields, update prisma/schema.prisma, then run npx prisma migrate dev and npx prisma generate; update types/queries accordingly.
- The Prisma client import path is /generated/prisma; ensure generator output path stays in sync with src/lib/db.ts imports.
- For SSR/edge contexts, TRPC client uses NEXT_PUBLIC_APP_URL on the server to construct API URLs; set it to the canonical base (e.g., http://localhost:3000 in dev).
- Inngest runs through the Next.js API route; triggering comes from tRPC mutations (projects/messages). Ensure env keys are set or these flows will no-op/fail.
- Sandbox health: src/inngest/sandbox-health.ts provides utilities to check if E2B sandboxes are responding and auto-restart the Next.js dev server if needed. The UI (redesigned-fragment.tsx) automatically runs health checks when displaying previews. API route at /api/sandbox/health handles server-side restart logic.
- E2B sandboxes may stop responding after timeouts/crashes; health check system detects this and restarts the dev server automatically (1-30 seconds).
- testsprite_tests contains Python-based UI tests; repo doesn't ship Node test runner.

AI Agent System Deep Dive
- The agent uses a multi-phase architecture detection system:
  - Phase 1: Infrastructure (requirement-analyzer.ts determines frontend vs full-stack)
  - Phase 2: Integration (fullstack-tools.ts for backend + DB generation)
  - Phase 3: Self-healing (error-detection-tools.ts for runtime validation)
- Conversation memory system (src/inngest/memory.ts):
  - Tracks last 8 messages per project for context continuity
  - Extracts domain-specific info (colors, components, layout) automatically
  - Handles modification requests ("make it red", "change to dark mode") by referencing previous context
  - Uses extractContextFromMessage() to parse user intent and isModification flag
- Agent tools available during code generation:
  - terminal: Execute shell commands in E2B sandbox
  - createOrUpdateFiles: Write/update files in sandbox
  - readFiles: Read file contents from sandbox
  - checkForErrors: Self-healing tool that detects runtime errors and fixes them
  - Full-stack tools (conditional): generatePrismaSchema, setupBackend, seedDatabase
- System prompts in src/prompt.ts:
  - PROMPT: Frontend-only system instructions (Next.js 15, Tailwind, shadcn/ui rules)
  - FULLSTACK_PROMPT: Backend-enabled system instructions
  - RESPONSE_PROMPT: User-friendly message generator
  - FRAGMENT_TITLE_PROMPT: Title generator for code fragments
- Agent enforces strict rules:
  - Must use "use client" (quoted string) for client components
  - Never run npm run dev/build/start (server already running with hot reload)
  - All styling via Tailwind (no .css/.scss files)
  - Import shadcn/ui components individually from @/components/ui/*
  - Use relative paths for file operations (not /home/user/...)
  - cn() utility MUST be imported from @/lib/utils (not @/components/ui/utils)

Architecture Decisions
- Fragment data model stores both frontend and backend metadata:
  - architecture: "frontend" | "fullstack"
  - backendUrl: Backend API URL (port 8000) if full-stack
  - dbType: "sqlite" | "postgres" | null
  - dbSchema: Prisma schema as JSON
  - files: All generated code as JSON object
- Module structure follows domain-driven design:
  - Each module has server/procedures.ts (tRPC) + ui/components/ + ui/views/
  - Keeps related functionality co-located
  - Easy to add new modules by following the pattern
- tRPC procedures patterns:
  - Use protectedProcedure for auth-required endpoints
  - Always validate inputs with Zod schemas
  - Return minimal data (select only needed fields)
  - Handle errors with TRPCError for proper status codes

Common Development Tasks
- Adding a new tRPC procedure:
  1. Add to appropriate router in src/modules/*/server/procedures.ts
  2. Define Zod schema for input validation
  3. Use protectedProcedure if auth required
  4. Import router in src/trpc/routers/_app.ts if new module
- Modifying agent behavior:
  1. Edit system prompts in src/prompt.ts for instruction changes
  2. Add tools in src/inngest/function.ts for new capabilities
  3. Adjust requirement-analyzer.ts for architecture detection logic
- Adding shadcn/ui components:
  1. All components pre-installed in src/components/ui/
  2. Import individually: import { Button } from "@/components/ui/button"
  3. Use cn() from @/lib/utils for conditional classes
- Debugging agent runs:
  1. Check agent logs with emoji prefixes (🚀 start, 🧠 memory, 🔍 analysis, ❌ error, ✅ success)
  2. Inspect Fragment.files in database for generated code
  3. Check ConversationMemory for context tracking
  4. Review sandbox URLs (port 3000=frontend, 8000=backend)
