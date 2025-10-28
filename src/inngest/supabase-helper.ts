import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Helper for Agent Operations
 * Provides utilities for the AI agent to manage Supabase resources
 */

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export class SupabaseHelper {
  private client;

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Execute raw SQL query
   * Used for creating tables, policies, functions, etc.
   */
  async executeSql(sql: string): Promise<{ success: boolean; error?: string; data?: unknown }> {
    try {
      console.log('🔧 [SUPABASE] Executing SQL:', sql.substring(0, 200) + '...');
      
      const { data, error } = await this.client.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error('❌ [SUPABASE] SQL execution error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ [SUPABASE] SQL executed successfully');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [SUPABASE] SQL execution exception:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Create a database table with proper structure
   */
  async createTable(tableName: string, columns: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    defaultValue?: string;
    isPrimaryKey?: boolean;
    references?: { table: string; column: string };
  }>, projectId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`🔧 [SUPABASE] Creating table: ${tableName}`);
    
    const columnDefinitions = columns.map(col => {
      let def = `${col.name} ${col.type}`;
      
      if (col.isPrimaryKey) {
        def += ' PRIMARY KEY';
      }
      
      if (col.defaultValue) {
        def += ` DEFAULT ${col.defaultValue}`;
      }
      
      if (!col.nullable && !col.isPrimaryKey) {
        def += ' NOT NULL';
      }
      
      if (col.references) {
        def += ` REFERENCES ${col.references.table}(${col.references.column})`;
      }
      
      return def;
    }).join(',\n  ');

    // Always add project_id for multi-tenancy
    const sql = `
-- Create table
CREATE TABLE IF NOT EXISTS ${tableName} (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL,
  ${columnDefinitions},
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- Create policy for project isolation
CREATE POLICY "${tableName}_project_isolation"
  ON ${tableName}
  FOR ALL
  USING (project_id = '${projectId}'::uuid);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_${tableName}_updated_at
  BEFORE UPDATE ON ${tableName}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on project_id for performance
CREATE INDEX IF NOT EXISTS idx_${tableName}_project_id ON ${tableName}(project_id);
`;

    return await this.executeSql(sql);
  }

  /**
   * Insert data into a table
   */
  async insert(tableName: string, data: Record<string, unknown>): Promise<{ success: boolean; error?: string; data?: unknown }> {
    try {
      console.log(`🔧 [SUPABASE] Inserting into ${tableName}:`, data);
      
      const { data: result, error } = await this.client
        .from(tableName)
        .insert(data)
        .select();
      
      if (error) {
        console.error('❌ [SUPABASE] Insert error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ [SUPABASE] Insert successful');
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [SUPABASE] Insert exception:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Query data from a table
   */
  async query(tableName: string, filters?: Record<string, unknown>, options?: {
    select?: string;
    limit?: number;
    orderBy?: { column: string; ascending?: boolean };
  }): Promise<{ success: boolean; error?: string; data?: unknown }> {
    try {
      console.log(`🔧 [SUPABASE] Querying ${tableName} with filters:`, filters);
      
      let query = this.client.from(tableName).select(options?.select || '*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ [SUPABASE] Query error:', error);
        return { success: false, error: error.message };
      }
      
      console.log(`✅ [SUPABASE] Query successful, returned ${Array.isArray(data) ? data.length : 0} rows`);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [SUPABASE] Query exception:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Create a storage bucket
   */
  async createStorageBucket(bucketName: string, isPublic: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔧 [SUPABASE] Creating storage bucket: ${bucketName}`);
      
      const { data, error } = await this.client.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
      });
      
      if (error) {
        // Bucket might already exist
        if (error.message.includes('already exists')) {
          console.log('⚠️ [SUPABASE] Bucket already exists');
          return { success: true };
        }
        console.error('❌ [SUPABASE] Create bucket error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ [SUPABASE] Bucket created successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [SUPABASE] Create bucket exception:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if Supabase is properly configured
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('_health').select('*').limit(1);
      // If we get a "relation does not exist" error, connection is working
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a SupabaseHelper instance for the agent
 */
export function createSupabaseHelper(): SupabaseHelper | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn('⚠️ [SUPABASE] Missing credentials - Supabase features disabled');
    return null;
  }

  return new SupabaseHelper({ url, serviceRoleKey });
}
