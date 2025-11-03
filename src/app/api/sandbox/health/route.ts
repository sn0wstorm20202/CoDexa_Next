import { NextRequest, NextResponse } from 'next/server';
import { extractSandboxId, ensureSandboxHealthy } from '@/inngest/sandbox-health';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sandboxUrl, fragmentId } = body;

    if (!sandboxUrl) {
      return NextResponse.json(
        { success: false, error: 'Sandbox URL is required' },
        { status: 400 }
      );
    }

    console.log('🏥 [API] Health check request:', { sandboxUrl, fragmentId });

    // Extract sandbox ID from URL
    const sandboxId = extractSandboxId(sandboxUrl);

    if (!sandboxId) {
      return NextResponse.json(
        { success: false, error: 'Invalid sandbox URL format' },
        { status: 400 }
      );
    }

    console.log('🏥 [API] Extracted sandbox ID:', sandboxId);

    // Ensure sandbox is healthy
    const result = await ensureSandboxHealthy(sandboxId);

    console.log('🏥 [API] Health check result:', result);

    return NextResponse.json({
      success: result.isHealthy,
      isHealthy: result.isHealthy,
      wasRestarted: result.wasRestarted,
      error: result.error,
      sandboxId
    });

  } catch (error) {
    console.error('❌ [API] Health check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
