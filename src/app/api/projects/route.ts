import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProject = await prisma.project.create({ data: body });
    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
  }
}
