import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
import { Sandbox } from "@e2b/code-interpreter";
import { SANDBOX_TIMEOUt } from "@/inngest/type";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fragmentId, testContent } = body;

        console.log('🔍 Debug Sandbox - Starting test for fragment:', fragmentId);

        if (!fragmentId) {
            return NextResponse.json({ 
                error: 'Fragment ID is required' 
            }, { status: 400 });
        }

        // Get fragment from database
        const fragment = await prisma.fragment.findUnique({
            where: { id: fragmentId }
        });

        if (!fragment) {
            return NextResponse.json({ 
                error: 'Fragment not found' 
            }, { status: 404 });
        }

        console.log('📄 Fragment found:', {
            id: fragment.id,
            sandboxUrl: fragment.sandboxUrl,
            title: fragment.title
        });

        // Extract sandbox ID using multiple patterns
        let sandboxId: string | undefined;
        
        // Pattern 1: https://{port}-{sandboxId}.e2b.app (current format)
        const e2bAppMatch = fragment.sandboxUrl.match(/https:\/\/\d+-([a-zA-Z0-9]+)\.e2b\.app/);
        if (e2bAppMatch) {
            sandboxId = e2bAppMatch[1];
        }
        
        // Pattern 2: https://{sandboxId}.e2b.dev (legacy format)
        if (!sandboxId) {
            sandboxId = fragment.sandboxUrl.match(/https:\/\/([^.-]+)\.e2b\.dev/)?.[1];
        }
        
        // Pattern 3: https://{sandboxId}-3000.{host}.e2b.dev (another legacy format)
        if (!sandboxId) {
            sandboxId = fragment.sandboxUrl.match(/https:\/\/([^.-]+)-\d+\.[^.]+\.e2b\.dev/)?.[1];
        }

        console.log('🆔 Extracted sandbox ID:', sandboxId);

        if (!sandboxId) {
            return NextResponse.json({
                error: 'Could not extract sandbox ID',
                sandboxUrl: fragment.sandboxUrl,
                patterns: [
                    'https://{sandboxId}.e2b.dev',
                    'https://{sandboxId}-3000.{host}.e2b.dev',
                    'Extract from subdomain'
                ]
            }, { status: 400 });
        }

        // Test sandbox connection
        console.log('🔌 Attempting to connect to sandbox:', sandboxId);
        
        let sandbox;
        try {
            sandbox = await Sandbox.connect(sandboxId);
            await sandbox.setTimeout(SANDBOX_TIMEOUt);
            console.log('✅ Sandbox connected successfully');
        } catch (connectionError) {
            console.error('❌ Sandbox connection failed:', connectionError);
            return NextResponse.json({
                error: 'Sandbox connection failed',
                sandboxId,
                connectionError: connectionError instanceof Error ? connectionError.message : String(connectionError),
                stack: connectionError instanceof Error ? connectionError.stack : undefined
            }, { status: 500 });
        }

        // Test file operations
        const testFileName = 'debug-test.txt';
        const testFileContent = testContent || `Test file created at ${new Date().toISOString()}`;

        try {
            console.log('📝 Writing test file:', testFileName);
            await sandbox.files.write(testFileName, testFileContent);
            console.log('✅ Test file written successfully');

            // Try to read it back
            console.log('📖 Reading test file back...');
            const readContent = await sandbox.files.read(testFileName);
            console.log('✅ Test file read successfully:', readContent.substring(0, 50) + '...');

            // List files in sandbox
            console.log('📂 Listing sandbox files...');
            const files = await sandbox.files.list('/');
            console.log('📂 Sandbox files:', files);

        } catch (fileError) {
            console.error('❌ File operation failed:', fileError);
            return NextResponse.json({
                error: 'File operation failed',
                sandboxId,
                fileError: fileError instanceof Error ? fileError.message : String(fileError)
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Sandbox test completed successfully',
            data: {
                fragmentId,
                sandboxId,
                sandboxUrl: fragment.sandboxUrl,
                testFileName,
                testContent: testFileContent,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('🚨 Debug endpoint error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Sandbox Debug Endpoint',
        usage: 'POST with { fragmentId: "fragment-id", testContent?: "optional test content" }'
    });
}