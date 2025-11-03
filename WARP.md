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
