import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { projectId, supabaseUrl, supabaseAnonKey, supabaseServiceKey } = body;

    // Validate required fields
    if (!projectId || !supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, supabaseUrl, supabaseAnonKey" },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Test Supabase connection by checking auth endpoint
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Try to get session - this validates credentials without needing tables
      const { error } = await supabase.auth.getSession();
      
      // If there's an auth error (not just "no session"), credentials are invalid
      if (error && error.message.includes("Invalid API key")) {
        throw new Error("Invalid Supabase credentials");
      }
      
      // Connection successful!
    } catch (testError: any) {
      return NextResponse.json(
        { error: `Failed to connect to Supabase: ${testError.message}` },
        { status: 400 }
      );
    }

    // Extract project ID from URL (e.g., https://abcdefgh.supabase.co -> abcdefgh)
    const projectIdMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\./);
    const supabaseProjectId = projectIdMatch ? projectIdMatch[1] : null;

    // Update project with Supabase credentials
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceKey: supabaseServiceKey || null,
        supabaseProjectId,
        supabaseEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Supabase connected successfully",
      project: {
        id: updatedProject.id,
        supabaseEnabled: updatedProject.supabaseEnabled,
        supabaseProjectId: updatedProject.supabaseProjectId,
      },
    });
  } catch (error: any) {
    console.error("Error connecting Supabase:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
