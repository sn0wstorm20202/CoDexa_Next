import { getSandbox } from "./utils";

/**
 * Check if the Next.js dev server is responding on port 3000
 */
export async function checkSandboxHealth(sandboxId: string): Promise<boolean> {
  try {
    console.log('🔍 [HEALTH] Checking sandbox health:', sandboxId);
    
    const sandbox = await getSandbox(sandboxId);
    
    // Try to check if server is responding
    const result = await sandbox.commands.run(
      'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000',
      { timeout: 5000 }
    );
    
    const statusCode = result.stdout.trim();
    const isHealthy = statusCode === '200' || statusCode === '304';
    
    console.log('🔍 [HEALTH] Health check result:', {
      sandboxId,
      statusCode,
      isHealthy
    });
    
    return isHealthy;
  } catch (error) {
    console.error('❌ [HEALTH] Health check failed:', error);
    return false;
  }
}

/**
 * Restart the Next.js dev server in the sandbox
 */
export async function restartSandboxServer(sandboxId: string): Promise<boolean> {
  try {
    console.log('🔄 [HEALTH] Restarting sandbox server:', sandboxId);
    
    const sandbox = await getSandbox(sandboxId);
    
    // Kill any existing Next.js processes
    console.log('🔄 [HEALTH] Killing existing processes...');
    await sandbox.commands.run('pkill -f "next dev" || true');
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start the dev server in background
    console.log('🔄 [HEALTH] Starting dev server...');
    await sandbox.commands.run(
      'cd /home/user && nohup npx next dev --turbopack > /tmp/next.log 2>&1 &'
    );
    
    // Wait for server to start (up to 30 seconds)
    console.log('⏳ [HEALTH] Waiting for server to start...');
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResult = await sandbox.commands.run(
        'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000',
        { timeout: 2000 }
      ).catch(() => ({ stdout: '000' }));
      
      const statusCode = checkResult.stdout.trim();
      
      if (statusCode === '200' || statusCode === '304') {
        console.log('✅ [HEALTH] Server restarted successfully after', attempts + 1, 'seconds');
        return true;
      }
      
      attempts++;
      
      if (attempts % 5 === 0) {
        console.log('⏳ [HEALTH] Still waiting...', attempts, '/', maxAttempts);
      }
    }
    
    console.error('❌ [HEALTH] Server failed to start after', maxAttempts, 'seconds');
    
    // Try to get logs for debugging
    try {
      const logs = await sandbox.commands.run('tail -n 50 /tmp/next.log');
      console.error('❌ [HEALTH] Server logs:', logs.stdout);
    } catch (logError) {
      console.error('❌ [HEALTH] Could not retrieve logs:', logError);
    }
    
    return false;
  } catch (error) {
    console.error('❌ [HEALTH] Failed to restart server:', error);
    return false;
  }
}

/**
 * Ensure sandbox is healthy, restart if needed
 */
export async function ensureSandboxHealthy(sandboxId: string): Promise<{
  isHealthy: boolean;
  wasRestarted: boolean;
  error?: string;
}> {
  try {
    console.log('🏥 [HEALTH] Ensuring sandbox health:', sandboxId);
    
    // First check if it's healthy
    const isHealthy = await checkSandboxHealth(sandboxId);
    
    if (isHealthy) {
      console.log('✅ [HEALTH] Sandbox is healthy, no restart needed');
      return { isHealthy: true, wasRestarted: false };
    }
    
    console.log('⚠️ [HEALTH] Sandbox is unhealthy, attempting restart...');
    
    // Try to restart
    const restartSuccess = await restartSandboxServer(sandboxId);
    
    if (restartSuccess) {
      console.log('✅ [HEALTH] Sandbox restarted successfully');
      return { isHealthy: true, wasRestarted: true };
    }
    
    console.error('❌ [HEALTH] Failed to restart sandbox');
    return { 
      isHealthy: false, 
      wasRestarted: false,
      error: 'Failed to restart Next.js server'
    };
    
  } catch (error) {
    console.error('❌ [HEALTH] Error ensuring sandbox health:', error);
    return { 
      isHealthy: false, 
      wasRestarted: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract sandbox ID from E2B URL
 */
export function extractSandboxId(sandboxUrl: string): string | null {
  try {
    // Pattern 1: https://{port}-{sandboxId}.e2b.app (current format)
    const e2bAppMatch = sandboxUrl.match(/https:\/\/\d+-([a-zA-Z0-9]+)\.e2b\.app/);
    if (e2bAppMatch) {
      return e2bAppMatch[1];
    }

    // Pattern 2: https://{sandboxId}.e2b.dev (legacy format)
    const e2bDevMatch = sandboxUrl.match(/https:\/\/([^.-]+)\.e2b\.dev/);
    if (e2bDevMatch) {
      return e2bDevMatch[1];
    }

    // Pattern 3: https://{sandboxId}-3000.{host}.e2b.dev (another legacy format)
    const e2bDevHostMatch = sandboxUrl.match(/https:\/\/([^.-]+)-\d+\.[^.]+\.e2b\.dev/);
    if (e2bDevHostMatch) {
      return e2bDevHostMatch[1];
    }

    console.error('❌ [HEALTH] Could not extract sandbox ID from URL:', sandboxUrl);
    return null;
  } catch (error) {
    console.error('❌ [HEALTH] Error extracting sandbox ID:', error);
    return null;
  }
}
