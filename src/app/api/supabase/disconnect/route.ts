import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing required field: projectId" },
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

    // Remove Supabase credentials
    await prisma.project.update({
      where: { id: projectId },
      data: {
        supabaseUrl: null,
        supabaseAnonKey: null,
        supabaseServiceKey: null,
        supabaseProjectId: null,
        supabaseEnabled: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Supabase disconnected successfully",
    });
  } catch (error: any) {
    console.error("Error disconnecting Supabase:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
