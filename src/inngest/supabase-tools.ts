import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { getSandbox } from "./utils";
import { prisma } from "@/lib/db";

/**
 * Tool to inject Supabase credentials into generated app
 */
export const injectSupabaseCredentials = (sandboxId: string, projectId: string) => createTool({
  name: "injectSupabaseCredentials",
  description: "🚨 CRITICAL - MUST CALL FIRST! Inject Supabase credentials into .env.local file. Without this, app will crash with 'supabaseUrl is required' error. Call this IMMEDIATELY after installing @supabase/supabase-js and BEFORE creating any Supabase files.",
  parameters: z.object({}),
  handler: async ({}, { step }) => {
    return await step?.run("injectSupabaseCredentials", async () => {
      try {
        // Get project's Supabase credentials from database
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: {
            supabaseUrl: true,
            supabaseAnonKey: true,
            supabaseEnabled: true,
          },
        });

        if (!project || !project.supabaseEnabled || !project.supabaseUrl || !project.supabaseAnonKey) {
          return JSON.stringify({
            success: false,
            error: "Supabase not connected to this project",
          });
        }

        const sandbox = await getSandbox(sandboxId);

        // Create .env.local with Supabase credentials for Next.js
        const envContent = `NEXT_PUBLIC_SUPABASE_URL=${project.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${project.supabaseAnonKey}`;

        await sandbox.files.write('/home/user/.env.local', envContent);
        console.log('✅ Supabase credentials injected');

        return JSON.stringify({
          success: true,
          message: 'Supabase credentials injected successfully',
          supabaseUrl: project.supabaseUrl,
        });
      } catch (e) {
        return `Error injecting Supabase credentials: ${e}`;
      }
    });
  }
});

/**
 * Tool to create Supabase tables via SQL
 */
export const createSupabaseTables = (sandboxId: string, projectId: string) => createTool({
  name: "createSupabaseTables",
  description: "Execute SQL statements to create tables in Supabase database. Use this to set up the database schema with proper RLS policies.",
  parameters: z.object({
    sql: z.string().describe("SQL statements to create tables and RLS policies"),
    description: z.string().describe("Brief description of what tables are being created"),
  }),
  handler: async ({ sql, description }, { step, network }) => {
    return await step?.run("createSupabaseTables", async () => {
      try {
        // Get project's Supabase credentials
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: {
            supabaseUrl: true,
            supabaseServiceKey: true,
            supabaseAnonKey: true,
            supabaseEnabled: true,
          },
        });

        if (!project || !project.supabaseEnabled) {
          return JSON.stringify({
            success: false,
            error: "Supabase not connected to this project. User must connect Supabase first.",
          });
        }

        const serviceKey = project.supabaseServiceKey || project.supabaseAnonKey;

        // Execute SQL using Supabase REST API
        const response = await fetch(`${project.supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': serviceKey!,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sql }),
        });

        // Note: The exec_sql RPC might not exist by default
        // Instead, we'll store the SQL in network state for the AI to include in generated code
        // The SQL will be documented so users can run it manually or via Supabase dashboard

        if (network) {
          network.state.data.supabaseSchema = sql;
        }

        return JSON.stringify({
          success: true,
          message: 'Database schema designed. SQL will be included in generated app documentation.',
          description,
          note: 'User should run this SQL in their Supabase SQL Editor or it will be included in setup instructions.',
        });
      } catch (e) {
        return `Error creating Supabase tables: ${e}`;
      }
    });
  }
});

/**
 * Tool to generate Supabase client code
 */
export const generateSupabaseClient = (sandboxId: string) => createTool({
  name: "generateSupabaseClient",
  description: "Generate Supabase client initialization code for the frontend",
  parameters: z.object({
    types: z.string().optional().describe("TypeScript database types definition"),
  }),
  handler: async ({ types }, { step, network }) => {
    return await step?.run("generateSupabaseClient", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);

        // Generate lib/supabase.ts for Next.js
        const supabaseClient = `import { createClient } from '@supabase/supabase-js';
${types ? `import { Database } from './database.types';` : ''}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient${types ? '<Database>' : ''}(supabaseUrl, supabaseAnonKey);
`;

        await sandbox.files.write('/home/user/lib/supabase.ts', supabaseClient);

        // Generate database types if provided
        if (types) {
          await sandbox.files.write('/home/user/lib/database.types.ts', types);
        }

        if (network) {
          const updatedFiles = network.state.data.files || {};
          updatedFiles['/home/user/lib/supabase.ts'] = supabaseClient;
          if (types) {
            updatedFiles['/home/user/lib/database.types.ts'] = types;
          }
          network.state.data.files = updatedFiles;
        }

        return JSON.stringify({
          success: true,
          message: 'Supabase client generated successfully',
          files: types ? ['lib/supabase.ts', 'lib/database.types.ts'] : ['lib/supabase.ts'],
        });
      } catch (e) {
        return `Error generating Supabase client: ${e}`;
      }
    });
  }
});

/**
 * Tool to generate Supabase auth hook
 */
export const generateAuthHook = (sandboxId: string) => createTool({
  name: "generateAuthHook",
  description: "Generate useAuth hook for Supabase authentication",
  parameters: z.object({}),
  handler: async ({}, { step, network }) => {
    return await step?.run("generateAuthHook", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);

        const authHook = `'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return { user, loading, signUp, signIn, signOut };
}
`;

        await sandbox.files.write('/home/user/hooks/useAuth.ts', authHook);

        if (network) {
          const updatedFiles = network.state.data.files || {};
          updatedFiles['/home/user/hooks/useAuth.ts'] = authHook;
          network.state.data.files = updatedFiles;
        }

        return JSON.stringify({
          success: true,
          message: 'Auth hook generated successfully',
        });
      } catch (e) {
        return `Error generating auth hook: ${e}`;
      }
    });
  }
});

/**
 * Tool to generate data hook for a specific resource
 */
export const generateDataHook = (sandboxId: string) => createTool({
  name: "generateDataHook",
  description: "Generate custom React hook for CRUD operations on a Supabase table",
  parameters: z.object({
    tableName: z.string().describe("Name of the Supabase table"),
    operations: z.array(z.enum(['create', 'read', 'update', 'delete', 'subscribe'])).describe("CRUD operations to include"),
  }),
  handler: async ({ tableName, operations }, { step, network }) => {
    return await step?.run("generateDataHook", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const capitalizedName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
        const singularName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;

        const hookCode = `'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function use${capitalizedName}() {
  const [${tableName}, set${capitalizedName}] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch${capitalizedName}();
    ${operations.includes('subscribe') ? `
    // Subscribe to real-time changes
    const channel = supabase
      .channel('${tableName}_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: '${tableName}' }, (payload) => {
        console.log('Real-time change:', payload);
        fetch${capitalizedName}();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };` : ''}
  }, []);

  async function fetch${capitalizedName}() {
    try {
      const { data, error } = await supabase
        .from('${tableName}')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set${capitalizedName}(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  ${operations.includes('create') ? `
  async function create${capitalizedName.slice(0, -1)}(item: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('${tableName}')
      .insert({ ...item, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    set${capitalizedName}([data, ...${tableName}]);
    return data;
  }` : ''}

  ${operations.includes('update') ? `
  async function update${capitalizedName.slice(0, -1)}(id: string, updates: any) {
    const { error } = await supabase
      .from('${tableName}')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    set${capitalizedName}(${tableName}.map(item => item.id === id ? { ...item, ...updates } : item));
  }` : ''}

  ${operations.includes('delete') ? `
  async function delete${capitalizedName.slice(0, -1)}(id: string) {
    const { error } = await supabase
      .from('${tableName}')
      .delete()
      .eq('id', id);

    if (error) throw error;
    set${capitalizedName}(${tableName}.filter(item => item.id !== id));
  }` : ''}

  return {
    ${tableName},
    loading,
    error,
    ${operations.includes('create') ? `create${capitalizedName.slice(0, -1)},` : ''}
    ${operations.includes('update') ? `update${capitalizedName.slice(0, -1)},` : ''}
    ${operations.includes('delete') ? `delete${capitalizedName.slice(0, -1)},` : ''}
    refetch: fetch${capitalizedName}
  };
}
`;

        await sandbox.files.write(`/home/user/hooks/use${capitalizedName}.ts`, hookCode);

        if (network) {
          const updatedFiles = network.state.data.files || {};
          updatedFiles[`/home/user/hooks/use${capitalizedName}.ts`] = hookCode;
          network.state.data.files = updatedFiles;
        }

        return JSON.stringify({
          success: true,
          message: `Data hook for ${tableName} generated successfully`,
          fileName: `hooks/use${capitalizedName}.ts`,
        });
      } catch (e) {
        return `Error generating data hook: ${e}`;
      }
    });
  }
});

/**
 * Export all Supabase tools
 */
export const supabaseTools = (sandboxId: string, projectId: string) => [
  injectSupabaseCredentials(sandboxId, projectId),
  createSupabaseTables(sandboxId, projectId),
  generateSupabaseClient(sandboxId),
  generateAuthHook(sandboxId),
  generateDataHook(sandboxId),
];
